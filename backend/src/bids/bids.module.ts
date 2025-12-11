import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, StripeModule, AuthModule],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}

