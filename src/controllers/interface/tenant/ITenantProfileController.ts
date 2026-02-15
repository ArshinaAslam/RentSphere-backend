import { Request, Response } from 'express'; 
import { AuthRequest } from '../../../middleware/auth.middleware';



export interface ITenantProfileController{
     editTenantProfile(req: AuthRequest, res: Response): Promise<Response>;
     changeTenantPassword(req: AuthRequest,res: Response): Promise<Response>
}