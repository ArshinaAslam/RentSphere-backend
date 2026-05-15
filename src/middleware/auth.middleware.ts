import jwt from "jsonwebtoken";

import { HttpStatus } from "../common/enums/httpStatus.enum";
import { AppError } from "../common/errors/appError";
import { ENV } from "../config/env";

import type { NextFunction, Request, Response } from "express";

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
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const { accessToken: cookieToken } = req.cookies as {
    accessToken: string | undefined;
  };

  const accessToken = headerToken ?? cookieToken;

  if (!accessToken) {
    throw new AppError(
      "Access denied. No token provided.",
      HttpStatus.UNAUTHORIZED,
    );
  }

  const decoded = jwt.verify(accessToken, ENV.JWT_ACCESS_SECRET) as JwtPayload;
  req.user = decoded;
  next();
};
