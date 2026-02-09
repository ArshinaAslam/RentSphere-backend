import { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors/appError";
import { HttpStatus } from "../common/enums/httpStatus.enum";
import { MESSAGES } from "../common/constants/statusMessages";
import logger from "../utils/logger";


export function  globalErrorHandler( 
   err: unknown,
   req: Request,
   res: Response,
   next: NextFunction
){

    if(err instanceof AppError){
        
       logger.error('AppError caught', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    
    ip: req.ip
  });


        return res.status(err.statuscode).json({success:false,message:err.message})
    }
    
    console.error('UNHANDLED ERROR:', err);
    logger.error('UNHANDLED ERROR - Generic', {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : 'No stack trace',
    url: req.url,
    method: req.method,
    ip: req.ip,
    
  });

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({success:false,message:MESSAGES.COMMON.INTERNAL_SERVER_ERROR})

}