
import { Request, Response } from 'express'; 


export interface IAdminAuthController{
    adminLogin(req: Request, res: Response): Promise<Response>;
    refreshAdminToken(req: Request, res: Response): Promise<Response>;
    logout(req: Request, res: Response): Promise<Response> ;
}