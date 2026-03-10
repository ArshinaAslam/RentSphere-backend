import type {
  AddToWishlistDto,
  GetWishlistQueryDto,
  RemoveFromWishlistDto,
} from "../../../dto/tenant/tenant.wishlist.dto";
import type { IWishlist } from "../../../models/wishistModel";

export interface GetWishlistResult {
  items: IWishlist[];
  total: number;
  page: number;
  limit: number;
}
export interface ITenantWishlistService {
  addToWishlist(dto: AddToWishlistDto): Promise<IWishlist>;
  removeFromWishlist(dto: RemoveFromWishlistDto): Promise<void>;
  getWishlist(dto: GetWishlistQueryDto): Promise<GetWishlistResult>;
  //   isWishlisted(tenantId: string, propertyId: string): Promise<boolean>;
}
