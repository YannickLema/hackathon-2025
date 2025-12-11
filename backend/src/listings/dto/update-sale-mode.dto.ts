import { SaleMode } from '@prisma/client';

export class UpdateSaleModeDto {
  saleMode!: SaleMode;
  auctionStartPrice?: number;
  auctionEndAt?: string | Date;
}


