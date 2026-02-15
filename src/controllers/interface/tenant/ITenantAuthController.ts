
import { Request, Response } from 'express'; 


export interface ITenantAuthController{
    tenantSignup(req: Request, res: Response): Promise<Response>;
    googleAuth(req: Request, res: Response): Promise<Response>;
    verifyTenantOtp(req: Request, res: Response): Promise<Response>;
    resendTenantOtp(req: Request, res: Response): Promise<Response>;
    tenantLogin(req: Request, res: Response): Promise<Response>;
    tenantForgotPassword(req: Request, res: Response): Promise<Response>;
    tenantResetPassword(req: Request, res: Response): Promise<Response>;
    refreshTenantToken(req: Request, res: Response): Promise<Response>;
    logout(req: Request, res: Response): Promise<Response> 
}