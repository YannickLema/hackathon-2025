import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { User, Role, SaleMode, ListingStatus } from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

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

    // Créer un payment intent
    const amount = Number(listing.priceDesired);
    const paymentIntent = await this.stripeService.createPaymentIntent(
      user,
      amount,
      listingId,
    );

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount,
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
    });

    if (!listing) {
      throw new NotFoundException('Listing introuvable');
    }

    // Marquer le listing comme terminé
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.ENDED,
      },
    });

    return {
      success: true,
      message: 'Achat confirmé avec succès',
      listingId,
    };
  }
}

