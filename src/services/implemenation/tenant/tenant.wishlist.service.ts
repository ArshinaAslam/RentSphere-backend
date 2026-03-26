// import { injectable, inject } from "tsyringe";

// import { DI_TYPES } from "../../../common/di/types";
// import { HttpStatus } from "../../../common/enums/httpStatus.enum";
// import { AppError } from "../../../common/errors/appError";
// import {
//   AddToWishlistDto,
//   GetWishlistQueryDto,
//   RemoveFromWishlistDto,
// } from "../../../dto/tenant/tenant.wishlist.dto";

// import type { IWishlist } from "../../../models/wishistModel";
// import type { IWishlistRepository } from "../../../repositories/interface/IWishlistRepository";
// import type {
//   GetWishlistResult,
//   ITenantWishlistService,
// } from "../../interface/tenant/ITenantWishlistService";

// @injectable()
// export class TenantWishlistService implements ITenantWishlistService {
//   constructor(
//     @inject(DI_TYPES.WishlistRepository)
//     private _wishlistRepo: IWishlistRepository,
//   ) {}

//   async addToWishlist(dto: AddToWishlistDto): Promise<IWishlist> {
//     const already = await this._wishlistRepo.isWishlisted(dto);
//     if (already) {
//       throw new AppError("Property already in wishlist", HttpStatus.CONFLICT);
//     }
//     return this._wishlistRepo.add(dto);
//   }

//   async removeFromWishlist(dto: RemoveFromWishlistDto): Promise<void> {
//     await this._wishlistRepo.remove(dto.tenantId, dto.propertyId);
//   }

//   async getWishlist(dto: GetWishlistQueryDto): Promise<GetWishlistResult> {
//     const skip = (dto.page - 1) * dto.limit;

//     const [items, total] = await Promise.all([
//       this._wishlistRepo.findByTenantIdPaginated(dto.tenantId, skip, dto.limit),
//       this._wishlistRepo.countByTenantId(dto.tenantId),
//     ]);

//     return { items, total, page: dto.page, limit: dto.limit };
//   }
// }
import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  AddToWishlistDto,
  GetWishlistQueryDto,
  RemoveFromWishlistDto,
} from "../../../dto/tenant/tenant.wishlist.dto";
import {
  WishlistMapper,
  type AddToWishlistResponseDto,
  type GetWishlistResponseDto,
} from "../../../mappers/wishlist.mapper";

import type { IWishlistRepository } from "../../../repositories/interface/IWishlistRepository";
import type { ITenantWishlistService } from "../../interface/tenant/ITenantWishlistService";

@injectable()
export class TenantWishlistService implements ITenantWishlistService {
  constructor(
    @inject(DI_TYPES.WishlistRepository)
    private _wishlistRepo: IWishlistRepository,
  ) {}

  async addToWishlist(
    dto: AddToWishlistDto,
  ): Promise<AddToWishlistResponseDto> {
    const already = await this._wishlistRepo.isWishlisted(dto);
    if (already) {
      throw new AppError("Property already in wishlist", HttpStatus.CONFLICT);
    }

    const wishlist = await this._wishlistRepo.add(dto);
    return WishlistMapper.toAddResponseDto(wishlist);
  }

  async removeFromWishlist(dto: RemoveFromWishlistDto): Promise<void> {
    await this._wishlistRepo.remove(dto.tenantId, dto.propertyId);
  }

  async getWishlist(dto: GetWishlistQueryDto): Promise<GetWishlistResponseDto> {
    const skip = (dto.page - 1) * dto.limit;

    const [items, total] = await Promise.all([
      this._wishlistRepo.findByTenantIdPaginated(dto.tenantId, skip, dto.limit),
      this._wishlistRepo.countByTenantId(dto.tenantId),
    ]);

    return WishlistMapper.toGetWishlistResponseDto(
      items,
      total,
      dto.page,
      dto.limit,
    );
  }
}
