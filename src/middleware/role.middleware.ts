
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../common/errors/appError';
import { HttpStatus } from '../common/enums/httpStatus.enum';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export const authorizeRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    logger.info('Role authorization check', { 
      userId: req.user?.userId,
      userRole: req.user?.role,
      requiredRoles: roles 
    });

    
    if (!req.user) {
      logger.warn('Role check failed - No user (use authenticateToken first!)');
      return next(new AppError('Authentication required', HttpStatus.UNAUTHORIZED));
    }
    
    
    const userRole = req.user.role as UserRole;
    console.log("role",userRole)
    
    if (!roles.includes(userRole)) {
      logger.warn('Access denied - Insufficient role', {
        userId: req.user.userId,
        userRole,
        requiredRoles: roles
      });
      return next(new AppError(
        'Access denied: Unauthorized role',
        HttpStatus.FORBIDDEN
      ));
    }

    logger.info('Role authorized', { 
      userId: req.user.userId, 
      role: userRole 
    });

    console.log("reached rome middleware for approvekyc")
    next();
  };
};


export const tenantOnly = authorizeRole('TENANT');
export const landlordOnly = authorizeRole('LANDLORD');
export const adminOnly = authorizeRole('ADMIN');
export const tenantOrLandlord = authorizeRole('TENANT', 'LANDLORD');

