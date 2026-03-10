export interface AddToWishlistDto {
  tenantId: string;
  propertyId: string;
}

export interface WishlistItemDto {
  _id: string;
  propertyId: string;
  tenantId: string;
  createdAt: Date;
}

export interface GetWishlistQueryDto {
  tenantId: string;
  page: number;
  limit: number;
}

export interface RemoveFromWishlistDto {
  tenantId: string;
  propertyId: string;
}
