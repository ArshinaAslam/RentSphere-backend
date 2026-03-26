import type { IProperty } from "../models/propertyModel";
import type { IWishlist } from "../models/wishistModel";

export interface WishlistPropertyDto {
  _id: string;
  title: string;
  address: string;
  city: string;
  images: string[];
  price: number;
  bhk: string;
  type: string;
  furnishing: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
}

export interface WishlistItemResponseDto {
  _id: string;
  tenantId: string;
  property: WishlistPropertyDto | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToWishlistResponseDto {
  _id: string;
  tenantId: string;
  propertyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetWishlistResponseDto {
  items: WishlistItemResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class WishlistMapper {
  static toAddResponseDto(wishlist: IWishlist): AddToWishlistResponseDto {
    return {
      _id: String(wishlist._id),
      tenantId: String(wishlist.tenantId),
      propertyId: String(wishlist.propertyId),
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  static toItemResponseDto(wishlist: IWishlist): WishlistItemResponseDto {
    const propertyId = wishlist.propertyId;

    const isPopulated =
      typeof propertyId === "object" &&
      propertyId !== null &&
      "title" in (propertyId as object);

    const mappedProperty: WishlistPropertyDto | string = isPopulated
      ? {
          _id: String((propertyId as IProperty)._id),
          title: (propertyId as IProperty).title,
          address: (propertyId as IProperty).address,
          city: (propertyId as IProperty).city,
          images: (propertyId as IProperty).images ?? [],
          price: (propertyId as IProperty).price,
          bhk: (propertyId as IProperty).bhk,
          type: (propertyId as IProperty).type,
          furnishing: (propertyId as IProperty).furnishing ?? "",
          bedrooms: (propertyId as IProperty).bedrooms,
          bathrooms: (propertyId as IProperty).bathrooms,
          area: (propertyId as IProperty).area,
          status: (propertyId as IProperty).status,
        }
      : String(propertyId);

    return {
      _id: String(wishlist._id),
      tenantId: String(wishlist.tenantId),
      property: mappedProperty,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  static toGetWishlistResponseDto(
    items: IWishlist[],
    total: number,
    page: number,
    limit: number,
  ): GetWishlistResponseDto {
    return {
      items: items.map((w) => WishlistMapper.toItemResponseDto(w)),
      total,
      page,
      limit,
    };
  }
}
