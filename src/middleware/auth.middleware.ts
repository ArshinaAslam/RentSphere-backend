import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../common/enums/httpStatus.enum";
import jwt from 'jsonwebtoken';
import { ENV } from "../config/env";
import { AppError } from "../common/errors/appError";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };

  
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticateToken = (
  req: AuthRequest,  
  res: Response,
  next: NextFunction
): void => {
  const accessToken = req.cookies?.accessToken;  

  console.log("authmiddleware url",req.url)
  
  if (!accessToken) {
   throw new AppError('Access denied. No token provided.', HttpStatus.UNAUTHORIZED)
  }

  const decoded = jwt.verify(accessToken, ENV.JWT_ACCESS_SECRET!) as JwtPayload;
  req.user = decoded; 
  console.log("reached authmiddleware for approvekyc",req.user) 
  next();
};
