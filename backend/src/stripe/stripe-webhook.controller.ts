import { Controller, Post, Req, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { PurchasesService } from '../purchases/purchases.service';
import { BidsService } from '../bids/bids.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('stripe/webhook')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly purchasesService: PurchasesService,
    private readonly bidsService: BidsService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.warn('⚠️  STRIPE_WEBHOOK_SECRET non configuré');
      return { received: true };
    }

    let event: Stripe.Event;

    try {
      event = Stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error('❌ Erreur de signature webhook:', err.message);
      return { error: 'Invalid signature' };
    }

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const listingId = paymentIntent.metadata?.listingId;
    const userId = paymentIntent.metadata?.userId;

    if (!listingId || !userId) {
      console.error('❌ Metadata manquante dans le payment intent');
      return;
    }

    try {
      // Vérifier si c'est un achat instantané ou une enchère
      // Pour l'instant, on traite seulement les achats instantanés
      // Les enchères seront traitées séparément
      console.log(`✅ Paiement réussi pour le listing ${listingId}`);
    } catch (error) {
      console.error('❌ Erreur lors du traitement du paiement:', error);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const listingId = paymentIntent.metadata?.listingId;
    console.error(`❌ Paiement échoué pour le listing ${listingId}`);
  }
}

