import { SaleMode } from '@prisma/client';

export type ListingPhotoInput = {
  url: string;
  position?: number;
};

export type ListingDocumentInput = {
  url: string;
  label?: string | null;
};

export class CreateListingDto {
  title!: string;
  categoryId!: string;
  dimensions!: string;
  weightKg!: number;
  description!: string;
  priceDesired!: number;
  saleMode!: SaleMode;
  auctionStartPrice?: number;
  auctionEndAt?: string | Date;
  photos!: ListingPhotoInput[];
  documents?: ListingDocumentInput[];
}
