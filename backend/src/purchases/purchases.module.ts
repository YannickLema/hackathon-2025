import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, StripeModule, AuthModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}

