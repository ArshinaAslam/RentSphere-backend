import type { IWishlist } from "../../models/wishistModel";

export interface IWishlistRepository {
  add(data: Partial<IWishlist>): Promise<IWishlist>;
  remove(tenantId: string, propertyId: string): Promise<void>;
  findByTenantIdPaginated(
    tenantId: string,
    skip: number,
    limit: number,
  ): Promise<IWishlist[]>;
  countByTenantId(tenantId: string): Promise<number>;
  isWishlisted(data: Partial<IWishlist>): Promise<boolean>;
}
