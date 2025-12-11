import { Controller, Post, Param, Req, Body, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedRequest = Request & { user?: User };

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('instant/:listingId')
  @UseGuards(JwtAuthGuard)
  async createInstantPurchase(
    @Req() req: AuthenticatedRequest,
    @Param('listingId') listingId: string,
  ) {
    return this.purchasesService.createInstantPurchase(req.user, listingId);
  }

  @Post('confirm/:listingId')
  @UseGuards(JwtAuthGuard)
  async confirmPurchase(
    @Req() req: AuthenticatedRequest,
    @Param('listingId') listingId: string,
    @Body() body: { paymentIntentId: string },
  ) {
    return this.purchasesService.confirmPurchase(
      req.user,
      listingId,
      body.paymentIntentId,
    );
  }
}

