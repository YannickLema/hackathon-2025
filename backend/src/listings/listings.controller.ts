import { 
  Body, 
  Controller, 
  Post, 
  Get,
  Param,
  Query,
  Req, 
  UseGuards 
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
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
}

