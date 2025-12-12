import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, SaleMode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateFormConfigDto } from './dto/create-form-config.dto';
import { UpdateFormConfigDto } from './dto/update-form-config.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getCommissions() {
    const [global, categories] = await Promise.all([
      this.prisma.platformCommission.findUnique({ where: { isGlobal: true } }),
      this.prisma.platformCommission.findMany({ where: { isGlobal: false } }),
    ]);

    return { global, categories };
  }

  async updateGlobalCommission(dto: UpdateCommissionDto) {
    if (dto.buyerRate === undefined && dto.sellerRate === undefined) {
      throw new BadRequestException('buyerRate ou sellerRate requis');
    }

    const data: Prisma.PlatformCommissionUpdateInput = {};
    if (dto.buyerRate !== undefined) data.buyerRate = dto.buyerRate;
    if (dto.sellerRate !== undefined) data.sellerRate = dto.sellerRate;

    return this.prisma.platformCommission.upsert({
      where: { isGlobal: true },
      update: data,
      create: {
        isGlobal: true,
        buyerRate: dto.buyerRate ?? 0,
        sellerRate: dto.sellerRate ?? 0,
      },
    });
  }

  async updateCategoryCommission(categoryId: string, dto: UpdateCommissionDto) {
    if (dto.buyerRate === undefined && dto.sellerRate === undefined) {
      throw new BadRequestException('buyerRate ou sellerRate requis');
    }

    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
    });
    if (!category) {
      throw new NotFoundException('Catégorie introuvable ou inactive');
    }

    const data: Prisma.PlatformCommissionUpdateInput = {};
    if (dto.buyerRate !== undefined) data.buyerRate = dto.buyerRate;
    if (dto.sellerRate !== undefined) data.sellerRate = dto.sellerRate;

    return this.prisma.platformCommission.upsert({
      where: { categoryId: category.id },
      update: data,
      create: {
        isGlobal: false,
        categoryId: category.id,
        buyerRate: dto.buyerRate ?? 0,
        sellerRate: dto.sellerRate ?? 0,
      },
    });
  }

  // --- Categories ---
  async listCategories() {
    return this.prisma.category.findMany({ orderBy: { label: 'asc' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { OR: [{ code: dto.code }, { label: dto.label }] },
    });
    if (existing) {
      throw new BadRequestException('Code ou libellé déjà utilisé');
    }
    return this.prisma.category.create({
      data: {
        code: dto.code,
        label: dto.label,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Catégorie introuvable');

    if (dto.code || dto.label) {
      const conflict = await this.prisma.category.findFirst({
        where: {
          id: { not: id },
          OR: [
            dto.code ? { code: dto.code } : undefined,
            dto.label ? { label: dto.label } : undefined,
          ].filter(Boolean) as Prisma.CategoryWhereInput[],
        },
      });
      if (conflict) {
        throw new BadRequestException('Code ou libellé déjà utilisé');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        code: dto.code ?? category.code,
        label: dto.label ?? category.label,
        isActive: dto.isActive ?? category.isActive,
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Catégorie introuvable');

    // Soft delete : désactivation
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // --- Users ---
  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        status: 'VERIFIED',
        emailVerified: true,
        professionnelProfile:
          dto.role === 'PROFESSIONNEL'
            ? {
                create: {
                  companyName: dto.companyName ?? 'Non renseigné',
                  siret: dto.siret ?? `SIRET-${Date.now()}`,
                  postalAddress: dto.postalAddress ?? 'Adresse non renseignée',
                  officialDocument: dto.officialDocument ?? '',
                  specialities: [],
                  mostSearchedItems: [],
                },
              }
            : undefined,
        particulierProfile:
          dto.role === 'PARTICULIER'
            ? {
                create: {
                  postalAddress: dto.postalAddress ?? 'Adresse non renseignée',
                },
              }
            : undefined,
      },
    });
    return { id: user.id, email: user.email, role: user.role };
  }

  async blockUser(id: string, block: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const status = block ? 'SUSPENDED' : 'VERIFIED';
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  // --- Listings vue admin ---
  async listAllListings(filters: {
    status?: string;
    saleMode?: string;
    sellerRole?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.ListingWhereInput = {};

    if (filters.status) {
      where.status = filters.status as any;
    }
    if (filters.saleMode) {
      where.saleMode = filters.saleMode as any;
    }
    if (filters.category) {
      const cat = await this.prisma.category.findFirst({
        where: {
          OR: [{ id: filters.category }, { code: filters.category }],
        },
      });
      if (cat) where.categoryId = cat.id;
    }
    if (filters.sellerRole) {
      where.seller = { role: filters.sellerRole as any };
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          photos: { take: 1, orderBy: { position: 'asc' } },
          category: true,
          seller: {
            select: {
              id: true,
              email: true,
              role: true,
              firstName: true,
              lastName: true,
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

  // --- Feedback admin ---
  async listFeedback(filters: { role?: string; minStars?: number; minNps?: number }) {
    const where: Prisma.FeedbackWhereInput = {};
    if (filters.role) {
      where.user = { role: filters.role as any };
    }
    if (filters.minStars !== undefined) {
      where.stars = { gte: filters.minStars };
    }
    if (filters.minNps !== undefined) {
      where.nps = { gte: filters.minNps };
    }
    return this.prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: { id: true, email: true, role: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Form configs (forms de dépôt) ---
  async listFormConfigs() {
    return this.prisma.listingFormConfig.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { category: true },
    });
  }

  async getFormConfig(id: string) {
    const form = await this.prisma.listingFormConfig.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!form) throw new NotFoundException('Formulaire introuvable');
    return form;
  }

  async createFormConfig(dto: CreateFormConfigDto) {
    let categoryId: string | undefined = undefined;
    if (dto.categoryId) {
      const cat = await this.prisma.category.findFirst({ where: { id: dto.categoryId, isActive: true } });
      if (!cat) throw new NotFoundException('Catégorie introuvable ou inactive');
      categoryId = cat.id;
    }

    await this.ensureFormConfigUnique(categoryId, dto.saleMode);

    return this.prisma.listingFormConfig.create({
      data: {
        categoryId,
        saleMode: dto.saleMode ?? null,
        fields: dto.fields as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateFormConfig(id: string, dto: UpdateFormConfigDto) {
    const existing = await this.prisma.listingFormConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Formulaire introuvable');

    let categoryId = existing.categoryId ?? undefined;
    let saleMode: SaleMode | null = existing.saleMode ?? null;
    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null as any) {
        categoryId = undefined;
      } else {
        const cat = await this.prisma.category.findFirst({ where: { id: dto.categoryId, isActive: true } });
        if (!cat) throw new NotFoundException('Catégorie introuvable ou inactive');
        categoryId = cat.id;
      }
    }
    if (dto.saleMode !== undefined) {
      saleMode = dto.saleMode ?? null;
    }
    await this.ensureFormConfigUnique(categoryId, saleMode ?? undefined, id);

    return this.prisma.listingFormConfig.update({
      where: { id },
      data: {
        categoryId: categoryId ?? null,
        saleMode: saleMode as SaleMode | null,
        fields: (dto.fields as Prisma.InputJsonValue | undefined) ?? (existing.fields as Prisma.InputJsonValue),
        isActive: dto.isActive ?? existing.isActive,
      },
    });
  }

  async deleteFormConfig(id: string) {
    const existing = await this.prisma.listingFormConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Formulaire introuvable');
    // soft delete
    return this.prisma.listingFormConfig.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async resolveFormConfig(categoryId?: string, saleMode?: SaleMode | null) {
    // Order of precedence:
    // 1) categoryId + saleMode
    // 2) categoryId only
    // 3) global (null/null)
    const items = await this.prisma.listingFormConfig.findMany({
      where: {
        isActive: true,
        OR: [
          { categoryId: categoryId ?? undefined, saleMode: saleMode ?? undefined },
          { categoryId: categoryId ?? undefined, saleMode: null },
          { categoryId: null, saleMode: null },
        ],
      },
      orderBy: [
        { categoryId: 'desc' }, // non-null first
        { saleMode: 'desc' },   // non-null first
        { updatedAt: 'desc' },
      ],
      take: 1,
    });
    return items[0] ?? null;
  }

  private async ensureFormConfigUnique(categoryId?: string, saleMode?: SaleMode | null, excludeId?: string) {
    const conflict = await this.prisma.listingFormConfig.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        categoryId: categoryId ?? null,
        saleMode: saleMode ?? null,
        isActive: true,
      },
    });
    if (conflict) {
      throw new BadRequestException('Un formulaire existe déjà pour cette combinaison catégorie/mode');
    }
  }
}

