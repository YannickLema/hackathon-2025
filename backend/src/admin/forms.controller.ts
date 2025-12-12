import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';
import { CreateFormConfigDto } from './dto/create-form-config.dto';
import { UpdateFormConfigDto } from './dto/update-form-config.dto';

@Controller('admin/forms')
@UseGuards(JwtAuthGuard, AdminGuard)
export class FormsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  list() {
    return this.adminService.listFormConfigs();
  }

  @Get('resolve')
  resolve(
    @Query('categoryId') categoryId?: string,
    @Query('saleMode') saleMode?: string,
  ) {
    return this.adminService.resolveFormConfig(categoryId, saleMode as any);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.adminService.getFormConfig(id);
  }

  @Post()
  create(@Body() dto: CreateFormConfigDto) {
    return this.adminService.createFormConfig(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormConfigDto) {
    return this.adminService.updateFormConfig(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.deleteFormConfig(id);
  }
}

