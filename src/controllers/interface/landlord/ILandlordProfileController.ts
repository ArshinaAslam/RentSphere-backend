import type { AuthRequest } from "../../../middleware/auth.middleware";
import type { Response } from "express";

export interface ILandlordProfileController {
  editLandlordProfile(req: AuthRequest, res: Response): Promise<Response>;
  changeLandlordPassword(req: AuthRequest, res: Response): Promise<Response>;
}
