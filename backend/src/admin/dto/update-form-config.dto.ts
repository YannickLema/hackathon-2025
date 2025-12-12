import { IsBoolean, IsOptional, IsString, IsEnum, IsObject } from 'class-validator';
import { SaleMode } from '@prisma/client';

export class UpdateFormConfigDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(SaleMode)
  saleMode?: SaleMode;

  @IsOptional()
  @IsObject()
  fields?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

