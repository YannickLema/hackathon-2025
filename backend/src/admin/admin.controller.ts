import { Controller, Get, Patch, Body, Param, UseGuards, Post, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { BlockUserDto } from './dto/block-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('commissions')
  getCommissions() {
    return this.adminService.getCommissions();
  }

  @Patch('commissions/global')
  updateGlobal(@Body() dto: UpdateCommissionDto) {
    return this.adminService.updateGlobalCommission(dto);
  }

  @Patch('commissions/category/:category')
  updateCategory(@Param('category') category: string, @Body() dto: UpdateCommissionDto) {
    return this.adminService.updateCategoryCommission(category, dto);
  }

  // --- Users (création / blocage) ---
  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string, @Body() dto: BlockUserDto) {
    return this.adminService.blockUser(id, dto.block ?? true);
  }

  // --- Listings (vue globale admin) ---
  @Get('listings')
  listAllListings(
    @Query('status') status?: string,
    @Query('saleMode') saleMode?: string,
    @Query('sellerRole') sellerRole?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listAllListings({
      status,
      saleMode,
      sellerRole,
      category,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  // --- Feedbacks ---
  @Get('feedback')
  listFeedback(
    @Query('role') role?: string,
    @Query('minStars') minStars?: string,
    @Query('minNps') minNps?: string,
  ) {
    return this.adminService.listFeedback({
      role,
      minStars: minStars ? Number(minStars) : undefined,
      minNps: minNps ? Number(minNps) : undefined,
    });
  }
}

