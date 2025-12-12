import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { FeedbackModule } from './feedback/feedback.module';
import { StripeModule } from './stripe/stripe.module';
import { BidsModule } from './bids/bids.module';
import { PurchasesModule } from './purchases/purchases.module';
import { AdminModule } from './admin/admin.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../../.env'),
    }),
    PrismaModule,
    AuthModule,
    ListingsModule,
    FeedbackModule,
    StripeModule,
    BidsModule,
    PurchasesModule,
    AdminModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
