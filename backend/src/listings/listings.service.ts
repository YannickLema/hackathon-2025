import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ListingCategory,
  ListingStatus,
  OfferStatus,
  Prisma,
  Role,
  SaleMode,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateSaleModeDto } from './dto/update-sale-mode.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { CreateBidDto } from './dto/create-bid.dto';

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createListing(user: User | undefined, dto: CreateListingDto) {
    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }
    // Les particuliers et professionnels peuvent créer des listings
    if (user.role !== Role.PROFESSIONNEL && user.role !== Role.PARTICULIER) {
      throw new ForbiddenException('Réservé aux particuliers et professionnels');
    }
    this.ensureValidPayload(dto);

    const priceDesired = new Prisma.Decimal(Number(dto.priceDesired));
    const weightKg = new Prisma.Decimal(Number(dto.weightKg));
    const now = new Date();
    let auctionStartPrice: Prisma.Decimal | null = null;
    let auctionEndAt: Date | null = null;

    if (dto.saleMode === SaleMode.AUCTION) {
      const startNumber =
        dto.auctionStartPrice != null
          ? Number(dto.auctionStartPrice)
          : Number(dto.priceDesired) * 0.9;
      if (!Number.isFinite(startNumber) || startNumber <= 0) {
        throw new BadRequestException('Le prix de départ des enchères doit être supérieur à 0');
      }
      auctionStartPrice = new Prisma.Decimal(startNumber);
      const end = dto.auctionEndAt ? new Date(dto.auctionEndAt) : this.addDays(now, 7);
      if (Number.isNaN(end.getTime()) || end <= now) {
        throw new BadRequestException('Date de fin des enchères invalide');
      }
      auctionEndAt = end;
    }

    const photos = dto.photos.map((photo, idx) => ({
      url: photo.url,
      position: photo.position ?? idx,
    }));
    const documents = dto.documents?.map((doc) => ({
      url: doc.url,
      label: doc.label ?? null,
    }));

    return this.prisma.listing.create({
      data: {
        sellerId: user.id,
        title: dto.title.trim(),
        category: dto.category,
        dimensions: dto.dimensions.trim(),
        weightKg,
        description: dto.description.trim(),
        priceDesired,
        saleMode: dto.saleMode,
        auctionStartPrice,
        auctionEndAt,
        publishedAt: now,
        status: ListingStatus.PUBLISHED,
        photos: { create: photos },
        documents: documents?.length ? { create: documents } : undefined,
      },
      include: { photos: true, documents: true },
    });
  }

  async findMyListings(user: User | undefined) {
    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }

    return this.prisma.listing.findMany({
      where: { sellerId: user.id },
      include: {
        photos: {
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyListingsWithStatus(user: User | undefined, status?: string) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Réservé aux vendeurs (professionnels ou particuliers)');
    }

    const whereStatus =
      status && Object.values(ListingStatus).includes(status as ListingStatus)
        ? (status as ListingStatus)
        : undefined;

    return this.prisma.listing.findMany({
      where: { sellerId: user.id, status: whereStatus },
      orderBy: { createdAt: 'desc' },
      include: {
        photos: true,
        documents: true,
        offers: { include: { buyer: true }, orderBy: { createdAt: 'desc' } },
        messages: { include: { sender: true }, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async getUnreadCounts(user: User | undefined) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Réservé aux vendeurs (professionnels ou particuliers)');
    }
    const [offers, messages] = await Promise.all([
      this.prisma.offer.count({
        where: { listing: { sellerId: user.id }, readBySeller: false },
      }),
      this.prisma.listingMessage.count({
        where: { listing: { sellerId: user.id }, readBySeller: false },
      }),
    ]);
    return { offersUnread: offers, messagesUnread: messages };
  }

  async markOffersRead(user: User | undefined, listingId: string) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Réservé aux vendeurs (professionnels ou particuliers)');
    }
    await this.ensureListingOwnership(user.id, listingId);
    const result = await this.prisma.offer.updateMany({
      where: { listingId, readBySeller: false },
      data: { readBySeller: true },
    });
    return { message: 'Offres marquées comme lues', count: result.count };
  }

  async markMessagesRead(user: User | undefined, listingId: string) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Réservé aux vendeurs (professionnels ou particuliers)');
    }
    await this.ensureListingOwnership(user.id, listingId);
    const result = await this.prisma.listingMessage.updateMany({
      where: { listingId, readBySeller: false },
      data: { readBySeller: true },
    });
    return { message: 'Messages marqués comme lus', count: result.count };
  }

  async search(params: {
    priceMin?: string;
    priceMax?: string;
    saleMode?: string;
    category?: string;
    status?: string;
    q?: string;
  }) {
    const { priceMin, priceMax, saleMode, category, status, q } = params;
    const where: Prisma.ListingWhereInput = {
      status:
        status && Object.values(ListingStatus).includes(status as ListingStatus)
          ? (status as ListingStatus)
          : ListingStatus.PUBLISHED,
    };
    if (saleMode && Object.values(SaleMode).includes(saleMode as SaleMode)) {
      where.saleMode = saleMode as SaleMode;
    }
    if (category && Object.values(ListingCategory).includes(category as ListingCategory)) {
      where.category = category as ListingCategory;
    }
    if (priceMin || priceMax) {
      const min = priceMin ? Number(priceMin) : undefined;
      const max = priceMax ? Number(priceMax) : undefined;
      where.priceDesired = {};
      if (min !== undefined && Number.isFinite(min)) {
        (where.priceDesired as Prisma.DecimalFilter).gte = new Prisma.Decimal(min);
      }
      if (max !== undefined && Number.isFinite(max)) {
        (where.priceDesired as Prisma.DecimalFilter).lte = new Prisma.Decimal(max);
      }
    }
    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const listings = await this.prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { photos: { orderBy: { position: 'asc' }, take: 1 } },
    });
    const listingIds = listings.map((l) => l.id);
    const bids = await this.prisma.bid.groupBy({
      by: ['listingId'],
      where: { listingId: { in: listingIds } },
      _max: { amount: true },
    });
    const highestMap = new Map<string, Prisma.Decimal | null>();
    bids.forEach((b) => highestMap.set(b.listingId, b._max.amount));

    return listings.map((l) => ({
      ...l,
      highestBid: highestMap.get(l.id) ?? null,
      availability: l.status === ListingStatus.PUBLISHED ? 'en vente' : 'plus disponible',
      saleModeLabel: l.saleMode === SaleMode.AUCTION ? 'ENCHERE' : 'VENTE_RAPIDE',
    }));
  }

  async createOffer(user: User | undefined, listingId: string, dto: CreateOfferDto) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (user.role === Role.PARTICULIER) {
      throw new ForbiddenException('Réservé aux acheteurs professionnels');
    }
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable');
    if (listing.sellerId === user.id) {
      throw new ForbiddenException('Impossible de faire une offre sur votre propre objet');
    }
    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new BadRequestException("L'objet n'est pas disponible");
    }
    if (listing.saleMode === SaleMode.AUCTION) {
      throw new BadRequestException('Enchère requise pour ce mode de vente');
    }
    const amountNumber = Number(dto.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    const accepted = await this.prisma.offer.findFirst({
      where: { listingId, status: OfferStatus.ACCEPTED },
    });
    if (accepted) {
      throw new BadRequestException('Une offre a déjà été acceptée sur cet objet');
    }

    const offer = await this.prisma.offer.create({
      data: {
        listingId,
        buyerId: user.id,
        amount: new Prisma.Decimal(amountNumber),
        message: dto.message ?? null,
        status: OfferStatus.ACCEPTED,
        readBySeller: false,
      },
      include: { buyer: true, listing: { select: { title: true, seller: true } } },
    });

    await this.emailService.sendOfferNotification({
      sellerEmail: offer.listing.seller.email,
      sellerFirstName: offer.listing.seller.firstName,
      listingTitle: offer.listing.title,
      offerAmount: amountNumber,
      buyerName: `${user.firstName} ${user.lastName}`,
    });

    // Première offre en vente rapide = vendu
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.ENDED },
    });

    return offer;
  }

  async createBid(user: User | undefined, listingId: string, dto: CreateBidDto) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (user.role === Role.PARTICULIER) {
      throw new ForbiddenException('Réservé aux acheteurs professionnels');
    }
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable');
    if (listing.sellerId === user.id) {
      throw new ForbiddenException('Impossible de faire une enchère sur votre propre objet');
    }
    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new BadRequestException("L'objet n'est pas disponible");
    }
    if (listing.saleMode !== SaleMode.AUCTION) {
      throw new BadRequestException('Enchère non autorisée sur une vente rapide');
    }
    if (listing.auctionEndAt && listing.auctionEndAt < new Date()) {
      throw new BadRequestException('Enchère terminée');
    }

    const amountNumber = Number(dto.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    const highest = await this.prisma.bid.findFirst({
      where: { listingId },
      orderBy: { amount: 'desc' },
      select: { amount: true },
    });
    const floor = listing.auctionStartPrice
      ? Number(listing.auctionStartPrice)
      : Number(listing.priceDesired) * 0.9;
    const minRequired = highest ? Number(highest.amount) + 0.01 : floor;
    if (amountNumber <= minRequired) {
      throw new BadRequestException(
        `L'enchère doit être > ${minRequired.toFixed(2)} (actuel ou prix de départ)`,
      );
    }

    const bid = await this.prisma.bid.create({
      data: {
        listingId,
        bidderId: user.id,
        amount: new Prisma.Decimal(amountNumber),
      },
      include: { listing: { select: { title: true, seller: true } }, bidder: true },
    });

    await this.emailService.sendOfferNotification({
      sellerEmail: bid.listing.seller.email,
      sellerFirstName: bid.listing.seller.firstName,
      listingTitle: bid.listing.title,
      offerAmount: amountNumber,
      buyerName: `${user.firstName} ${user.lastName}`,
    });

    return bid;
  }

  async createMessage(user: User | undefined, listingId: string, dto: CreateMessageDto) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (user.role === Role.PARTICULIER) {
      throw new ForbiddenException('Réservé aux acheteurs professionnels');
    }
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });
    if (!listing) throw new NotFoundException('Annonce introuvable');
    if (listing.sellerId === user.id) {
      throw new ForbiddenException('Impossible de vous envoyer un message à vous-même');
    }
    if (!dto?.content || !dto.content.trim()) {
      throw new BadRequestException('Message requis');
    }

    const message = await this.prisma.listingMessage.create({
      data: {
        listingId,
        senderId: user.id,
        content: dto.content.trim(),
        readBySeller: false,
      },
      include: { sender: true, listing: { select: { title: true, seller: true } } },
    });

    await this.emailService.sendMessageNotification({
      sellerEmail: message.listing.seller.email,
      sellerFirstName: message.listing.seller.firstName,
      listingTitle: message.listing.title,
      buyerName: `${user.firstName} ${user.lastName}`,
      messagePreview: dto.content.slice(0, 140),
    });
    return message;
  }

  async updateSaleMode(user: User | undefined, listingId: string, dto: UpdateSaleModeDto) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Réservé aux vendeurs (professionnels ou particuliers)');
    }
    await this.ensureListingOwnership(user.id, listingId);
    const offersCount = await this.prisma.offer.count({ where: { listingId } });
    if (offersCount > 0) {
      throw new BadRequestException("Impossible de changer le mode de vente s'il y a déjà des offres");
    }
    if (!dto?.saleMode || !Object.values(SaleMode).includes(dto.saleMode)) {
      throw new BadRequestException('Mode de vente invalide');
    }

    let auctionStartPrice: Prisma.Decimal | null = null;
    let auctionEndAt: Date | null = null;
    if (dto.saleMode === SaleMode.AUCTION) {
      const start = dto.auctionStartPrice ?? 0;
      if (!Number.isFinite(start) || start <= 0) {
        throw new BadRequestException('auctionStartPrice doit être > 0');
      }
      auctionStartPrice = new Prisma.Decimal(Number(start));
      const end = dto.auctionEndAt ? new Date(dto.auctionEndAt) : this.addDays(new Date(), 7);
      if (Number.isNaN(end.getTime()) || end <= new Date()) {
        throw new BadRequestException('auctionEndAt invalide');
      }
      auctionEndAt = end;
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data: { saleMode: dto.saleMode, auctionStartPrice, auctionEndAt },
    });
  }

  async updatePrice(user: User | undefined, listingId: string, dto: UpdatePriceDto) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Réservé aux vendeurs (professionnels ou particuliers)');
    }
    await this.ensureListingOwnership(user.id, listingId);
    const offersCount = await this.prisma.offer.count({ where: { listingId } });
    if (offersCount > 0) {
      throw new BadRequestException("Impossible de modifier le prix s'il y a déjà des offres");
    }
    const price = Number(dto.priceDesired);
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException('Le prix doit être supérieur à 0');
    }
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { priceDesired: new Prisma.Decimal(price) },
    });
  }

  async setFavorite(user: User | undefined, listingId: string, add: boolean) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (user.role !== Role.PROFESSIONNEL) {
      throw new ForbiddenException('Réservé aux professionnels');
    }
    await this.ensureListingExists(listingId);
    if (add) {
      await this.prisma.favorite.upsert({
        where: { userId_listingId: { userId: user.id, listingId } },
        update: {},
        create: { userId: user.id, listingId },
      });
      return { message: 'Ajouté aux favoris' };
    }
    await this.prisma.favorite.deleteMany({ where: { userId: user.id, listingId } });
    return { message: 'Retiré des favoris' };
  }

  async getFavorites(user: User | undefined) {
    if (!user) throw new ForbiddenException('Authentification requise');
    if (user.role !== Role.PROFESSIONNEL) {
      throw new ForbiddenException('Réservé aux professionnels');
    }
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: { listing: { include: { photos: { orderBy: { position: 'asc' }, take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
    const listingIds = favorites.map((f) => f.listingId);
    const bidGroups = await this.prisma.bid.groupBy({
      by: ['listingId'],
      where: { listingId: { in: listingIds } },
      _max: { amount: true },
    });
    const highestMap = new Map<string, Prisma.Decimal | null>();
    bidGroups.forEach((b) => highestMap.set(b.listingId, b._max.amount));
    return favorites.map((f) => ({
      ...f.listing,
      highestBid: highestMap.get(f.listingId) ?? null,
      availability: f.listing.status === ListingStatus.PUBLISHED ? 'en vente' : 'plus disponible',
      saleModeLabel: f.listing.saleMode === SaleMode.AUCTION ? 'ENCHERE' : 'VENTE_RAPIDE',
    }));
  }

  async getMyBids(user: User | undefined) {
    if (!user) throw new ForbiddenException('Authentification requise');
    const bids = await this.prisma.bid.findMany({
      where: { bidderId: user.id },
      include: { listing: { include: { photos: { orderBy: { position: 'asc' }, take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
    const listingIds = [...new Set(bids.map((b) => b.listingId))];
    const highest = await this.prisma.bid.groupBy({
      by: ['listingId'],
      where: { listingId: { in: listingIds } },
      _max: { amount: true },
    });
    const highestMap = new Map<string, Prisma.Decimal | null>();
    highest.forEach((b) => highestMap.set(b.listingId, b._max.amount));
    return bids.map((b) => ({
      listing: {
        ...b.listing,
        highestBid: highestMap.get(b.listingId) ?? null,
        availability: b.listing.status === ListingStatus.PUBLISHED ? 'en vente' : 'plus disponible',
        saleModeLabel: b.listing.saleMode === SaleMode.AUCTION ? 'ENCHERE' : 'VENTE_RAPIDE',
      },
      myBid: b.amount,
      bidAt: b.createdAt,
    }));
  }

  async getMyPurchases(user: User | undefined) {
    if (!user) throw new ForbiddenException('Authentification requise');
    const offers = await this.prisma.offer.findMany({
      where: { buyerId: user.id, status: OfferStatus.ACCEPTED },
      include: { listing: { include: { photos: { orderBy: { position: 'asc' }, take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
    return offers.map((o) => ({
      ...o.listing,
      myOffer: o.amount,
      status: o.listing.status,
      saleModeLabel: o.listing.saleMode === SaleMode.AUCTION ? 'ENCHERE' : 'VENTE_RAPIDE',
    }));
  }

  async getMyInstantOffers(user: User | undefined) {
    if (!user) throw new ForbiddenException('Authentification requise');
    const offers = await this.prisma.offer.findMany({
      where: {
        buyerId: user.id,
        listing: { saleMode: SaleMode.INSTANT_SALE },
      },
      include: { listing: { include: { photos: { orderBy: { position: 'asc' }, take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
    return offers.map((o) => ({
      ...o.listing,
      myOffer: o.amount,
      offerStatus: o.status,
      availability: o.listing.status === ListingStatus.PUBLISHED ? 'en vente' : 'plus disponible',
      saleModeLabel: 'VENTE_RAPIDE',
    }));
  }

  async getMyLostAuctions(user: User | undefined) {
    if (!user) throw new ForbiddenException('Authentification requise');
    const myBids = await this.prisma.bid.findMany({
      where: { bidderId: user.id },
      include: { listing: true },
    });
    const listingIds = [...new Set(myBids.map((b) => b.listingId))];
    if (listingIds.length === 0) return [];

    const highest = await this.prisma.bid.groupBy({
      by: ['listingId'],
      where: { listingId: { in: listingIds } },
      _max: { amount: true },
    });
    const highestMap = new Map<string, Prisma.Decimal | null>();
    highest.forEach((b) => highestMap.set(b.listingId, b._max.amount));

    const lostListings: Array<{
      id: string;
      myBid: Prisma.Decimal;
      highestBid: Prisma.Decimal | null;
      availability: string;
      saleModeLabel: string;
      [key: string]: unknown;
    }> = [];
    for (const b of myBids) {
      const highestAmount = highestMap.get(b.listingId);
      if (
        b.listing.saleMode === SaleMode.AUCTION &&
        b.listing.status === ListingStatus.SOLD &&
        highestAmount &&
        !highestAmount.equals(b.amount)
      ) {
        lostListings.push({
          ...b.listing,
          myBid: b.amount,
          highestBid: highestAmount,
          availability: 'plus disponible',
          saleModeLabel: 'ENCHERE',
        });
      }
    }
    return lostListings;
  }

  private ensureValidPayload(dto: CreateListingDto) {
    if (!dto?.title?.trim()) throw new BadRequestException('Le nom de l’objet est requis');
    if (!dto?.dimensions?.trim()) throw new BadRequestException('Les dimensions sont requises');
    if (!dto?.description?.trim()) throw new BadRequestException('La description est requise');
    if (!dto?.category || !Object.values(ListingCategory).includes(dto.category)) {
      throw new BadRequestException('Catégorie invalide');
    }
    if (!dto?.saleMode || !Object.values(SaleMode).includes(dto.saleMode)) {
      throw new BadRequestException('Mode de vente invalide');
    }
    const price = Number(dto.priceDesired);
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException('Le prix souhaité doit être supérieur à 0');
    }
    const weight = Number(dto.weightKg);
    if (!Number.isFinite(weight) || weight <= 0) {
      throw new BadRequestException('Le poids doit être supérieur à 0');
    }
    if (!dto.photos || dto.photos.length < 10) {
      throw new BadRequestException('Au moins 10 photos sont requises');
    }
    if (dto.photos.some((p) => !p?.url)) {
      throw new BadRequestException('Chaque photo doit contenir une URL');
    }
    if (dto.documents?.some((d) => !d?.url)) {
      throw new BadRequestException('Chaque document doit contenir une URL');
    }
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  async findAll(filters: {
    category?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.PUBLISHED,
    };

    if (filters.category) {
      where.category = filters.category as ListingCategory;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.priceDesired = {};
      if (filters.minPrice !== undefined) {
        where.priceDesired.gte = new Prisma.Decimal(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        where.priceDesired.lte = new Prisma.Decimal(filters.maxPrice);
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          photos: {
            orderBy: { position: 'asc' },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              particulierProfile: {
                select: {
                  profilePhoto: true,
                },
              },
              professionnelProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { position: 'asc' },
        },
        documents: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            particulierProfile: {
              select: {
                profilePhoto: true,
              },
            },
            professionnelProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      throw new BadRequestException('Listing introuvable');
    }

    return listing;
  }

  private isSeller(user: User) {
    return user.role === Role.PROFESSIONNEL || user.role === Role.PARTICULIER;
  }

  private async ensureListingOwnership(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    });
    if (!listing || listing.sellerId !== userId) {
      throw new ForbiddenException("Vous n'êtes pas propriétaire de cet objet");
    }
  }

  private async ensureListingExists(listingId: string) {
    const found = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!found) {
      throw new NotFoundException('Annonce introuvable');
    }
  }
}

