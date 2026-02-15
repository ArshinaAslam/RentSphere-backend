
import { Request, Response } from 'express'; 
import { AuthRequest } from '../../../middleware/auth.middleware';

export interface ILandlordProfileController{
    editLandlordProfile(req: AuthRequest,res: Response): Promise<Response>;
    changeLandlordPassword(req: AuthRequest,res: Response,): Promise<Response>;
}