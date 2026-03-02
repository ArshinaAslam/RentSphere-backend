import type { Request, Response } from "express";
export interface IAuthController {
  signup(req: Request, res: Response): Promise<Response>;
  googleAuth(req: Request, res: Response): Promise<Response>;
  verifyOtp(req: Request, res: Response): Promise<Response>;
  resendOtp(req: Request, res: Response): Promise<Response>;
  login(req: Request, res: Response): Promise<Response>;
  forgotPassword(req: Request, res: Response): Promise<Response>;
  resetPassword(req: Request, res: Response): Promise<Response>;
  refreshToken(req: Request, res: Response): Promise<Response>;
  logout(req: Request, res: Response): Promise<Response>;
}
