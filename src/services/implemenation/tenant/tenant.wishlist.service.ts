import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  AddToWishlistDto,
  GetWishlistQueryDto,
  RemoveFromWishlistDto,
} from "../../../dto/tenant/tenant.wishlist.dto";

import type { IWishlist } from "../../../models/wishistModel";
import type { IWishlistRepository } from "../../../repositories/interface/IWishlistRepository";
import type {
  GetWishlistResult,
  ITenantWishlistService,
} from "../../interface/tenant/ITenantWishlistService";

@injectable()
export class TenantWishlistService implements ITenantWishlistService {
  constructor(
    @inject(DI_TYPES.WishlistRepository)
    private _wishlistRepo: IWishlistRepository,
  ) {}

  async addToWishlist(dto: AddToWishlistDto): Promise<IWishlist> {
    const already = await this._wishlistRepo.isWishlisted(dto);
    if (already) {
      throw new AppError("Property already in wishlist", HttpStatus.CONFLICT);
    }
    return this._wishlistRepo.add(dto);
  }

  async removeFromWishlist(dto: RemoveFromWishlistDto): Promise<void> {
    await this._wishlistRepo.remove(dto.tenantId, dto.propertyId);
  }

  async getWishlist(dto: GetWishlistQueryDto): Promise<GetWishlistResult> {
    const skip = (dto.page - 1) * dto.limit;

    const [items, total] = await Promise.all([
      this._wishlistRepo.findByTenantIdPaginated(dto.tenantId, skip, dto.limit),
      this._wishlistRepo.countByTenantId(dto.tenantId),
    ]);

    return { items, total, page: dto.page, limit: dto.limit };
  }

  //   async isWishlisted(tenantId: string, propertyId: string): Promise<boolean> {
  //     return this._wishlistRepo.isWishlisted(tenantId, propertyId);
  //   }
}
