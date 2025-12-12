import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CategoriesController } from './categories.controller';
import { FormsController } from './forms.controller';
import { StripeAdminController } from './stripe-admin.controller';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [PrismaModule, AuthModule, StripeModule],
  controllers: [AdminController, CategoriesController, FormsController, StripeAdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}

