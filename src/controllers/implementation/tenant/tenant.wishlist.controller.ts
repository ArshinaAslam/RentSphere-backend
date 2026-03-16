import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../../common/response/ApiResponse";
import {
  AddToWishlistDto,
  RemoveFromWishlistDto,
} from "../../../dto/tenant/tenant.wishlist.dto";

import type { ITenantWishlistService } from "../../../services/interface/tenant/ITenantWishlistService";
import type { Request, Response } from "express";

@injectable()
export class TenantWishlistController {
  constructor(
    @inject(DI_TYPES.TenantWishlistService)
    private _wishlistService: ITenantWishlistService,
  ) {}

  async addToWishlist(req: Request, res: Response): Promise<Response> {
    const dto = req.body as AddToWishlistDto;
    if (!dto.tenantId || !dto.propertyId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "tenantId and propertyId required"));
    }
    const item = await this._wishlistService.addToWishlist(dto);
    return res
      .status(HttpStatus.CREATED)
      .json(new ApiResponses(true, "Added to wishlist", item));
  }

  async removeFromWishlist(req: Request, res: Response): Promise<Response> {
    const dto = req.body as RemoveFromWishlistDto;
    await this._wishlistService.removeFromWishlist(dto);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Removed from wishlist"));
  }

  async getWishlist(req: Request, res: Response): Promise<Response> {
    const tenantId =
      typeof req.query.tenantId === "string" ? req.query.tenantId : "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;

    if (!tenantId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(new ApiResponses(false, "tenantId required"));
    }

    const result = await this._wishlistService.getWishlist({
      tenantId,
      page,
      limit,
    });
    console.log("result", result);
    return res
      .status(HttpStatus.OK)
      .json(new ApiResponses(true, "Wishlist fetched", result));
  }
}
