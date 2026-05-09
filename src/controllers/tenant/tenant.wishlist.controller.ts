import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../common/constants/statusMessages";
import { DI_TYPES } from "../../common/di/types";
import { HttpStatus } from "../../common/enums/httpStatus.enum";
import { ApiResponses } from "../../common/response/ApiResponse";
import {
  AddToWishlistDto,
  RemoveFromWishlistDto,
} from "../../dto/tenant/tenant.wishlist.dto";

import type { ITenantWishlistService } from "../../services/interface/tenant/ITenantWishlistService";
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
        .json(ApiResponses.error(MESSAGES.WISHLIST.REQUIRED_FIELDS));
    }

    const item = await this._wishlistService.addToWishlist(dto);

    return res
      .status(HttpStatus.CREATED)
      .json(ApiResponses.success(item, MESSAGES.WISHLIST.ADD_SUCCESS));
  }

  async removeFromWishlist(req: Request, res: Response): Promise<Response> {
    const dto = req.body as RemoveFromWishlistDto;

    await this._wishlistService.removeFromWishlist(dto);

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(null, MESSAGES.WISHLIST.REMOVE_SUCCESS));
  }

  async getWishlist(req: Request, res: Response): Promise<Response> {
    const tenantId =
      typeof req.query.tenantId === "string" ? req.query.tenantId : "";

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;

    if (!tenantId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(ApiResponses.error(MESSAGES.WISHLIST.TENANT_ID_REQUIRED));
    }

    const result = await this._wishlistService.getWishlist({
      tenantId,
      page,
      limit,
    });

    return res
      .status(HttpStatus.OK)
      .json(ApiResponses.success(result, MESSAGES.WISHLIST.FETCH_SUCCESS));
  }
}
