import { Controller, Post, Get, Req, UseGuards, Body, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

type AuthenticatedRequest = Request & { user?: User };

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  /**
   * Crée un setup intent pour ajouter une méthode de paiement
   * Réservé aux professionnels
   */
  @Post('setup-intent')
  @UseGuards(JwtAuthGuard)
  async createSetupIntent(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException('Utilisateur non authentifié');
    }

    if (user.role !== Role.PROFESSIONNEL) {
      throw new BadRequestException('Réservé aux professionnels');
    }

    const setupIntent = await this.stripeService.createSetupIntent(user);
    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    };
  }

  /**
   * Attache une méthode de paiement après confirmation du setup intent
   */
  @Post('attach-payment-method')
  @UseGuards(JwtAuthGuard)
  async attachPaymentMethod(
    @Req() req: AuthenticatedRequest,
    @Body() body: { paymentMethodId: string },
  ) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException('Utilisateur non authentifié');
    }

    if (user.role !== Role.PROFESSIONNEL) {
      throw new BadRequestException('Réservé aux professionnels');
    }

    if (!body.paymentMethodId) {
      throw new BadRequestException('paymentMethodId est requis');
    }

    await this.stripeService.attachPaymentMethod(user, body.paymentMethodId);
    return { success: true, message: 'Méthode de paiement ajoutée avec succès' };
  }

  /**
   * Vérifie si l'utilisateur a une méthode de paiement configurée
   */
  @Get('payment-method-status')
  @UseGuards(JwtAuthGuard)
  async getPaymentMethodStatus(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) {
      throw new BadRequestException('Utilisateur non authentifié');
    }

    if (user.role !== Role.PROFESSIONNEL) {
      return { hasPaymentMethod: false, message: 'Réservé aux professionnels' };
    }

    const hasPaymentMethod = await this.stripeService.hasPaymentMethod(user.id);
    const paymentMethod = await this.stripeService.getPaymentMethod(user.id);

    return {
      hasPaymentMethod,
      stripeCustomerId: paymentMethod?.stripeCustomerId || null,
    };
  }
}

