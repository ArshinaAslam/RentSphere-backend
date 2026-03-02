import type { AuthRequest } from "../../../middleware/auth.middleware";
import type { Response } from "express";

export interface ITenantProfileController {
  editTenantProfile(req: AuthRequest, res: Response): Promise<Response>;
  changeTenantPassword(req: AuthRequest, res: Response): Promise<Response>;
}
