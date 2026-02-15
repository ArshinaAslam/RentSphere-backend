
import { Request, Response } from 'express'; 
export interface ILandlordAuthController{
    landlordSignup(req: Request, res: Response): Promise<Response> ;
    googleAuth(req: Request, res: Response): Promise<Response>;
    verifyLandlordOtp(req: Request, res: Response): Promise<Response>;
    resendLandlordOtp(req: Request, res: Response): Promise<Response>;
    landlordLogin(req: Request, res: Response): Promise<Response> ;
    landlordForgotPassword(req: Request, res: Response): Promise<Response>;
    refreshLandlordToken(req: Request, res: Response): Promise<Response> ;
    logout(req: Request, res: Response): Promise<Response>;
    submitLandlordKyc(req: Request, res: Response): Promise<Response> ;
    getKycStatus(req: Request, res: Response): Promise<Response>
}