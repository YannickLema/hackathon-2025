import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { User } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY') || 'sk_test_...';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  /**
   * Crée un client Stripe pour un utilisateur professionnel
   */
  async createCustomer(user: User): Promise<Stripe.Customer> {
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier si un customer existe déjà
    const existingPaymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { userId: user.id },
    });

    if (existingPaymentMethod?.stripeCustomerId) {
      // Récupérer le customer existant
      return await this.stripe.customers.retrieve(existingPaymentMethod.stripeCustomerId) as Stripe.Customer;
    }

    // Créer un nouveau customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id,
      },
    });

    // Sauvegarder dans la base de données
    await this.prisma.paymentMethod.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        stripeCustomerId: customer.id,
        isActive: true,
      },
      update: {
        stripeCustomerId: customer.id,
        isActive: true,
      },
    });

    return customer;
  }

  /**
   * Crée un setup intent pour ajouter une méthode de paiement
   */
  async createSetupIntent(user: User): Promise<Stripe.SetupIntent> {
    const customer = await this.createCustomer(user);

    const setupIntent = await this.stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    });

    return setupIntent;
  }

  /**
   * Attache une méthode de paiement à un customer
   */
  async attachPaymentMethod(user: User, paymentMethodId: string): Promise<void> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { userId: user.id },
    });

    if (!paymentMethod) {
      throw new BadRequestException('Customer Stripe non trouvé. Veuillez d\'abord créer un customer.');
    }

    // Attacher la méthode de paiement au customer
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: paymentMethod.stripeCustomerId,
    });

    // Définir comme méthode par défaut
    await this.stripe.customers.update(paymentMethod.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Mettre à jour dans la base de données
    await this.prisma.paymentMethod.update({
      where: { userId: user.id },
      data: {
        stripePaymentMethodId: paymentMethodId,
      },
    });
  }

  /**
   * Vérifie si un utilisateur a une méthode de paiement configurée
   */
  async hasPaymentMethod(userId: string): Promise<boolean> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { userId },
    });

    return !!paymentMethod?.stripePaymentMethodId;
  }

  /**
   * Récupère les informations de paiement d'un utilisateur
   */
  async getPaymentMethod(userId: string) {
    return await this.prisma.paymentMethod.findUnique({
      where: { userId },
    });
  }

  /**
   * Crée un payment intent pour un achat instantané
   */
  async createPaymentIntent(user: User, amount: number, listingId: string): Promise<Stripe.PaymentIntent> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { userId: user.id },
    });

    if (!paymentMethod?.stripePaymentMethodId) {
      throw new BadRequestException('Aucune méthode de paiement configurée. Veuillez ajouter une carte bancaire.');
    }

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      customer: paymentMethod.stripeCustomerId,
      payment_method: paymentMethod.stripePaymentMethodId,
      confirmation_method: 'manual',
      confirm: false,
      metadata: {
        userId: user.id,
        listingId,
      },
    });

    return paymentIntent;
  }
}

