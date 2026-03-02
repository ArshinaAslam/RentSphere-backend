import type { AuthRequest } from "../../../middleware/auth.middleware";
import type { Request, Response } from "express";

export interface ILandlordPropertyController {
  AddLandlordProperty(req: Request, res: Response): Promise<Response>;
  getLandlordProperties(req: Request, res: Response): Promise<Response>;
  getLandlordPropertyById(req: AuthRequest, res: Response): Promise<Response>;
  deleteLandlordProperty(req: AuthRequest, res: Response): Promise<Response>;
  editLandlordProperty(req: AuthRequest, res: Response): Promise<Response>;
}
