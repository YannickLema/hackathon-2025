import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { User, Role, SaleMode, ListingStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Place une enchère sur un listing
   * Vérifie que l'utilisateur est un professionnel avec une méthode de paiement
   */
  async placeBid(user: User | undefined, listingId: string, amount: number) {
    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    // Seuls les professionnels peuvent enchérir
    if (user.role !== Role.PROFESSIONNEL) {
      throw new ForbiddenException('Seuls les professionnels peuvent participer aux enchères');
    }

    // Vérifier que l'utilisateur a une méthode de paiement configurée
    const hasPaymentMethod = await this.stripeService.hasPaymentMethod(user.id);
    if (!hasPaymentMethod) {
      throw new BadRequestException(
        'Vous devez ajouter une méthode de paiement avant de pouvoir enchérir. ' +
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
      throw new BadRequestException('Ce listing n\'est plus disponible pour les enchères');
    }

    if (listing.saleMode !== SaleMode.AUCTION) {
      throw new BadRequestException('Ce listing n\'est pas en mode enchères');
    }

    // Vérifier que l'enchère n'est pas terminée
    if (listing.auctionEndAt && new Date() > listing.auctionEndAt) {
      throw new BadRequestException('Les enchères sont terminées pour ce listing');
    }

    // Vérifier que l'utilisateur n'est pas le vendeur
    if (listing.sellerId === user.id) {
      throw new BadRequestException('Vous ne pouvez pas enchérir sur vos propres objets');
    }

    // Vérifier que le montant est supérieur au prix de départ
    const startPrice = listing.auctionStartPrice
      ? Number(listing.auctionStartPrice)
      : Number(listing.priceDesired) * 0.9;

    if (amount < startPrice) {
      throw new BadRequestException(
        `Le montant doit être au moins égal au prix de départ (${startPrice}€)`,
      );
    }

    // Récupérer la meilleure enchère actuelle
    const currentWinningBid = await this.prisma.bid.findFirst({
      where: {
        listingId,
        isWinning: true,
      },
      orderBy: {
        amount: 'desc',
      },
    });

    // Vérifier que le montant est supérieur à l'enchère actuelle
    if (currentWinningBid) {
      const currentAmount = Number(currentWinningBid.amount);
      const minIncrement = currentAmount * 0.05; // 5% d'incrément minimum
      const minBid = currentAmount + minIncrement;

      if (amount <= currentAmount) {
        throw new BadRequestException(
          `Le montant doit être supérieur à l'enchère actuelle (${currentAmount}€)`,
        );
      }

      if (amount < minBid) {
        throw new BadRequestException(
          `L'incrément minimum est de 5%. Le montant minimum est ${minBid.toFixed(2)}€`,
        );
      }

      // Marquer l'ancienne enchère comme non gagnante
      await this.prisma.bid.update({
        where: { id: currentWinningBid.id },
        data: { isWinning: false },
      });
    }

    // Créer la nouvelle enchère
    const bid = await this.prisma.bid.create({
      data: {
        listingId,
        bidderId: user.id,
        amount: new Prisma.Decimal(amount),
        isWinning: true,
      },
      include: {
        bidder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionnelProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    return bid;
  }

  /**
   * Récupère les enchères d'un listing
   */
  async getListingBids(listingId: string) {
    const bids = await this.prisma.bid.findMany({
      where: { listingId },
      orderBy: { amount: 'desc' },
      include: {
        bidder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionnelProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    return bids;
  }

  /**
   * Récupère les enchères d'un utilisateur
   */
  async getUserBids(user: User | undefined) {
    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    const bids = await this.prisma.bid.findMany({
      where: { bidderId: user.id },
      include: {
        listing: {
          include: {
            photos: {
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bids;
  }

  /**
   * Récupère l'enchère gagnante actuelle d'un listing
   */
  async getCurrentWinningBid(listingId: string) {
    const bid = await this.prisma.bid.findFirst({
      where: {
        listingId,
        isWinning: true,
      },
      orderBy: {
        amount: 'desc',
      },
      include: {
        bidder: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionnelProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    return bid;
  }
}

