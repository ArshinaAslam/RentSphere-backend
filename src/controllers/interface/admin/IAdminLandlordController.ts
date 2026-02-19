import { Request, Response } from 'express';

export interface IAdminLandlordController {
   getLandlords(req: Request, res: Response): Promise<Response>;
   getLandlordDetails(req: Request, res: Response): Promise<Response>;
  toggleLandlordStatus(req: Request, res: Response): Promise<Response>;
  approveLandlordKyc(req: Request, res: Response): Promise<void> ;
  rejectLandlordKyc(req: Request, res: Response): Promise<void> ;
}