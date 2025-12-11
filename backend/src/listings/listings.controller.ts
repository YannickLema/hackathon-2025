import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateSaleModeDto } from './dto/update-sale-mode.dto';
import { UpdatePriceDto } from './dto/update-price.dto';
import { CreateBidDto } from './dto/create-bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type AuthenticatedRequest = Request & { user?: User };

@Controller('listings')
@UseGuards(JwtAuthGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(req.user, dto);
  }

  @Get('me')
  findMine(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
  ) {
    return this.listingsService.findMyListings(req.user, status);
  }

  @Get('me/unread-counts')
  getUnreadCounts(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getUnreadCounts(req.user);
  }

  @Get('search')
  search(
    @Req() req: AuthenticatedRequest,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('saleMode') saleMode?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.listingsService.search({
      priceMin,
      priceMax,
      saleMode,
      category,
      status,
      q,
    });
  }

  @Patch(':id/offers/read')
  markOffersRead(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.markOffersRead(req.user, id);
  }

  @Post(':id/offers')
  createOffer(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateOfferDto,
  ) {
    return this.listingsService.createOffer(req.user, id, dto);
  }

  @Patch(':id/messages/read')
  markMessagesRead(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.listingsService.markMessagesRead(req.user, id);
  }

  @Post(':id/messages')
  createMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.listingsService.createMessage(req.user, id, dto);
  }

  @Post(':id/bids')
  createBid(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.listingsService.createBid(req.user, id, dto);
  }

  @Patch(':id/sale-mode')
  updateSaleMode(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSaleModeDto,
  ) {
    return this.listingsService.updateSaleMode(req.user, id, dto);
  }

  @Patch(':id/price')
  updatePrice(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.listingsService.updatePrice(req.user, id, dto);
  }

  @Post(':id/favorite')
  addFavorite(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.setFavorite(req.user, id, true);
  }

  @Delete(':id/favorite')
  removeFavorite(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.setFavorite(req.user, id, false);
  }

  @Get('me/favorites')
  getFavorites(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getFavorites(req.user);
  }

  @Get('me/bids')
  getMyBids(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyBids(req.user);
  }

  @Get('me/purchases')
  getMyPurchases(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyPurchases(req.user);
  }

  @Get('me/offers')
  getMyInstantOffers(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyInstantOffers(req.user);
  }

  @Get('me/lost')
  getMyLostAuctions(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyLostAuctions(req.user);
  }
}

