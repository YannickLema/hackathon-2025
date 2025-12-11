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
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(req.user, dto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listingsService.findAll({
      category,
      status,
      search,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Get('seller/my')
  @UseGuards(JwtAuthGuard)
  findMyListings(@Req() req: AuthenticatedRequest) {
    return this.listingsService.findMyListings(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
  ) {
    return this.listingsService.findMyListingsWithStatus(req.user, status);
  }

  @Get('me/unread-counts')
  @UseGuards(JwtAuthGuard)
  getUnreadCounts(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getUnreadCounts(req.user);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  markOffersRead(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.markOffersRead(req.user, id);
  }

  @Post(':id/offers')
  @UseGuards(JwtAuthGuard)
  createOffer(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateOfferDto,
  ) {
    return this.listingsService.createOffer(req.user, id, dto);
  }

  @Patch(':id/messages/read')
  @UseGuards(JwtAuthGuard)
  markMessagesRead(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.listingsService.markMessagesRead(req.user, id);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  createMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.listingsService.createMessage(req.user, id, dto);
  }

  @Post(':id/bids')
  @UseGuards(JwtAuthGuard)
  createBid(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.listingsService.createBid(req.user, id, dto);
  }

  @Patch(':id/sale-mode')
  @UseGuards(JwtAuthGuard)
  updateSaleMode(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateSaleModeDto,
  ) {
    return this.listingsService.updateSaleMode(req.user, id, dto);
  }

  @Patch(':id/price')
  @UseGuards(JwtAuthGuard)
  updatePrice(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePriceDto,
  ) {
    return this.listingsService.updatePrice(req.user, id, dto);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  addFavorite(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.setFavorite(req.user, id, true);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  removeFavorite(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.listingsService.setFavorite(req.user, id, false);
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  getFavorites(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getFavorites(req.user);
  }

  @Get('me/bids')
  @UseGuards(JwtAuthGuard)
  getMyBids(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyBids(req.user);
  }

  @Get('me/purchases')
  @UseGuards(JwtAuthGuard)
  getMyPurchases(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyPurchases(req.user);
  }

  @Get('me/offers')
  @UseGuards(JwtAuthGuard)
  getMyInstantOffers(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyInstantOffers(req.user);
  }

  @Get('me/lost')
  @UseGuards(JwtAuthGuard)
  getMyLostAuctions(@Req() req: AuthenticatedRequest) {
    return this.listingsService.getMyLostAuctions(req.user);
  }
}
