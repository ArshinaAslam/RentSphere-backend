
import { Request, Response } from 'express'; 
export interface ILandlordKycController{
    submitLandlordKyc(req: Request, res: Response): Promise<Response> ;
    getKycStatus(req: Request, res: Response): Promise<Response>
}