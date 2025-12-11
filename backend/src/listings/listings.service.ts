import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
    ListingCategory,
    ListingStatus,
    Prisma,
    Role,
    SaleMode,
    User,
  } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createListing(user: User | undefined, dto: CreateListingDto) {
    if (!user) {
      throw new ForbiddenException('Authentification requise');
    }
    // Les particuliers et professionnels peuvent créer des listings
    if (user.role !== Role.PROFESSIONNEL && user.role !== Role.PARTICULIER) {
      throw new ForbiddenException('Réservé aux particuliers et professionnels');
    }

    this.ensureValidPayload(dto);

    const priceDesiredNumber = Number(dto.priceDesired);
    const weightNumber = Number(dto.weightKg);

    const priceDesired = new Prisma.Decimal(priceDesiredNumber);
    const weightKg = new Prisma.Decimal(weightNumber);

    const now = new Date();
    let auctionStartPrice: Prisma.Decimal | null = null;
    let auctionEndAt: Date | null = null;

    if (dto.saleMode === SaleMode.AUCTION) {
      const startNumber =
        dto.auctionStartPrice != null
          ? Number(dto.auctionStartPrice)
          : priceDesiredNumber * 0.9;
      if (!Number.isFinite(startNumber) || startNumber <= 0) {
        throw new BadRequestException(
          'Le prix de départ des enchères doit être supérieur à 0',
        );
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
      include: {
        photos: true,
        documents: true,
      },
    });
  }

  private ensureValidPayload(dto: CreateListingDto) {
    if (!dto?.title?.trim()) {
      throw new BadRequestException('Le nom de l’objet est requis');
    }
    if (!dto?.dimensions?.trim()) {
      throw new BadRequestException('Les dimensions sont requises');
    }
    if (!dto?.description?.trim()) {
      throw new BadRequestException('La description est requise');
    }
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
            take: 1, // Prendre seulement la première photo pour la liste
          },
          seller: {
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
}

