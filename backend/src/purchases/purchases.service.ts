import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { User, Role, SaleMode, ListingStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Calcule la commission pour un listing
   */
  private async calculateCommission(listingId: string, amount: number): Promise<{
    commissionRate: number;
    commissionAmount: number;
    sellerAmount: number;
  }> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { category: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing introuvable');
    }

    // Récupérer la commission (catégorie spécifique ou globale)
    let commission = await this.prisma.platformCommission.findFirst({
      where: listing.categoryId
        ? { categoryId: listing.categoryId, isGlobal: false }
        : { isGlobal: true },
    });

    // Si pas de commission spécifique, utiliser la globale
    if (!commission) {
      commission = await this.prisma.platformCommission.findUnique({
        where: { isGlobal: true },
      });
    }

    // Taux de commission par défaut si aucune commission n'est configurée
    const commissionRate = commission?.sellerRate ?? 0.1; // 10% par défaut
    const commissionAmount = amount * commissionRate;
    const sellerAmount = amount - commissionAmount;

    return {
      commissionRate,
      commissionAmount,
      sellerAmount,
    };
  }

  /**
   * Crée une offre d'achat instantané
   * Seuls les professionnels peuvent acheter
   */
  async createInstantPurchase(user: User | undefined, listingId: string) {
    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    // Seuls les professionnels peuvent acheter
    if (user.role !== Role.PROFESSIONNEL) {
      throw new ForbiddenException('Seuls les professionnels peuvent acheter des objets');
    }

    // Vérifier que l'utilisateur a une méthode de paiement
    const hasPaymentMethod = await this.stripeService.hasPaymentMethod(user.id);
    if (!hasPaymentMethod) {
      throw new BadRequestException(
        'Vous devez ajouter une méthode de paiement avant de pouvoir acheter. ' +
        'Veuillez configurer votre carte bancaire dans votre profil.',
      );
    }

    // Récupérer le listing
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing introuvable');
    }

    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new BadRequestException('Ce listing n\'est plus disponible');
    }

    if (listing.saleMode !== SaleMode.INSTANT_SALE) {
      throw new BadRequestException('Ce listing n\'est pas en vente instantanée');
    }

    // Vérifier que l'utilisateur n'est pas le vendeur
    if (listing.sellerId === user.id) {
      throw new BadRequestException('Vous ne pouvez pas acheter vos propres objets');
    }

    // Calculer la commission
    const amount = Number(listing.priceDesired);
    const { commissionAmount, sellerAmount } = await this.calculateCommission(listingId, amount);

    // Créer un payment intent avec le montant total (commission incluse dans le prix)
    const paymentIntent = await this.stripeService.createPaymentIntent(
      user,
      amount,
      listingId,
    );

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      commissionAmount,
      sellerAmount,
      currency: 'eur',
    };
  }

  /**
   * Confirme un achat après paiement réussi
   */
  async confirmPurchase(user: User | undefined, listingId: string, paymentIntentId: string) {
    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    if (user.role !== Role.PROFESSIONNEL) {
      throw new ForbiddenException('Seuls les professionnels peuvent acheter');
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true, category: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing introuvable');
    }

    // Vérifier le payment intent avec Stripe
    const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Le paiement n\'a pas été confirmé');
    }

    const amount = Number(listing.priceDesired);
    const { commissionRate, commissionAmount, sellerAmount } = await this.calculateCommission(
      listingId,
      amount,
    );

    // Créer l'enregistrement d'achat
    const purchase = await this.prisma.purchase.create({
      data: {
        listingId,
        buyerId: user.id,
        amount: amount,
        paymentIntentId,
        status: 'COMPLETED',
      },
    });

    // Enregistrer la commission
    await this.prisma.adminCommission.create({
      data: {
        listingId,
        purchaseId: purchase.id,
        sellerId: listing.sellerId,
        buyerId: user.id,
        amount: amount,
        commissionRate,
        commissionAmount,
        sellerAmount,
        categoryId: listing.categoryId,
      },
    });

    // Marquer le listing comme vendu
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.SOLD,
      },
    });

    return {
      success: true,
      message: 'Achat confirmé avec succès',
      listingId,
      purchaseId: purchase.id,
      commissionAmount,
      sellerAmount,
    };
  }

  /**
   * Crée un payment intent pour le gagnant d'une enchère
   */
  async createAuctionPurchase(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: true,
        category: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing introuvable');
    }

    if (listing.saleMode !== SaleMode.AUCTION) {
      throw new BadRequestException('Ce listing n\'est pas en mode enchères');
    }

    if (listing.status !== ListingStatus.ENDED) {
      throw new BadRequestException('Cette enchère n\'est pas encore terminée');
    }

    // Récupérer l'enchère gagnante
    const winningBid = await this.prisma.bid.findFirst({
      where: {
        listingId,
        isWinning: true,
      },
      include: {
        bidder: true,
      },
      orderBy: {
        amount: 'desc',
      },
    });

    if (!winningBid) {
      throw new NotFoundException('Aucune enchère gagnante trouvée');
    }

    // Vérifier que le gagnant a une méthode de paiement
    const hasPaymentMethod = await this.stripeService.hasPaymentMethod(winningBid.bidderId);
    if (!hasPaymentMethod) {
      throw new BadRequestException('Le gagnant n\'a pas de méthode de paiement configurée');
    }

    const amount = Number(winningBid.amount);
    const { commissionAmount, sellerAmount } = await this.calculateCommission(listingId, amount);

    // Créer un payment intent pour le gagnant
    const paymentIntent = await this.stripeService.createPaymentIntent(
      winningBid.bidder,
      amount,
      listingId,
    );

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      commissionAmount,
      sellerAmount,
      currency: 'eur',
      winnerId: winningBid.bidderId,
    };
  }

  /**
   * Confirme l'achat d'une enchère après paiement réussi
   */
  async confirmAuctionPurchase(listingId: string, paymentIntentId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true, category: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing introuvable');
    }

    // Récupérer l'enchère gagnante
    const winningBid = await this.prisma.bid.findFirst({
      where: {
        listingId,
        isWinning: true,
      },
      include: {
        bidder: true,
      },
      orderBy: {
        amount: 'desc',
      },
    });

    if (!winningBid) {
      throw new NotFoundException('Aucune enchère gagnante trouvée');
    }

    // Vérifier le payment intent avec Stripe
    const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Le paiement n\'a pas été confirmé');
    }

    const amount = Number(winningBid.amount);
    const { commissionRate, commissionAmount, sellerAmount } = await this.calculateCommission(
      listingId,
      amount,
    );

    // Créer l'enregistrement d'achat
    const purchase = await this.prisma.purchase.create({
      data: {
        listingId,
        buyerId: winningBid.bidderId,
        amount: amount,
        paymentIntentId,
        status: 'COMPLETED',
      },
    });

    // Enregistrer la commission
    await this.prisma.adminCommission.create({
      data: {
        listingId,
        purchaseId: purchase.id,
        sellerId: listing.sellerId,
        buyerId: winningBid.bidderId,
        amount: amount,
        commissionRate,
        commissionAmount,
        sellerAmount,
        categoryId: listing.categoryId,
      },
    });

    // Marquer le listing comme vendu
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.SOLD,
      },
    });

    return {
      success: true,
      message: 'Achat d\'enchère confirmé avec succès',
      listingId,
      purchaseId: purchase.id,
      commissionAmount,
      sellerAmount,
    };
  }
}

