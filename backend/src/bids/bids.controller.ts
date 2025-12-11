import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedRequest = Request & { user?: User };

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post(':listingId')
  @UseGuards(JwtAuthGuard)
  async placeBid(
    @Req() req: AuthenticatedRequest,
    @Param('listingId') listingId: string,
    @Body() body: { amount: number },
  ) {
    return this.bidsService.placeBid(req.user, listingId, body.amount);
  }

  @Get('listing/:listingId')
  async getListingBids(@Param('listingId') listingId: string) {
    return this.bidsService.getListingBids(listingId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getUserBids(@Req() req: AuthenticatedRequest) {
    return this.bidsService.getUserBids(req.user);
  }

  @Get('listing/:listingId/winning')
  async getCurrentWinningBid(@Param('listingId') listingId: string) {
    return this.bidsService.getCurrentWinningBid(listingId);
  }
}

