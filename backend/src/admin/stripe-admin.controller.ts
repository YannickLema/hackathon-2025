import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { StripeService } from '../stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/stripe')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StripeAdminController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('config')
  getConfig() {
    const hasKey = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== '';
    const mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'live' : 'test';
    return { hasKey, mode };
  }

  @Get('health')
  async health() {
    const ok = await this.stripeService.checkHealth();
    return { ok };
  }

  @Get('customers')
  async listCustomers(@Query('page') page = '1', @Query('limit') limit = '20') {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      this.prisma.paymentMethod.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        select: {
          userId: true,
          stripeCustomerId: true,
          stripePaymentMethodId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { email: true, role: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.paymentMethod.count(),
    ]);

    return {
      items,
      pagination: {
        page: p,
        limit: l,
        total,
        totalPages: Math.ceil(total / l),
      },
    };
  }

  @Get('customers/:userId')
  async getCustomer(@Param('userId') userId: string) {
    const pm = await this.prisma.paymentMethod.findUnique({
      where: { userId },
      select: {
        userId: true,
        stripeCustomerId: true,
        stripePaymentMethodId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true, role: true, firstName: true, lastName: true } },
      },
    });
    if (!pm) {
      return { found: false };
    }
    let stripeCustomer: any = null;
    if (pm.stripeCustomerId) {
      stripeCustomer = await this.stripeService.getCustomerRaw(pm.stripeCustomerId);
    }
    return { found: true, paymentMethod: pm, stripeCustomer };
  }
}

