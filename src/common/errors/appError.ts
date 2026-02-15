import { HttpStatus } from "../enums/httpStatus.enum";

export class AppError extends Error{

    public readonly statuscode : HttpStatus ;
    public readonly isOperational = true ;

    constructor(message : string , statuscode : HttpStatus){
        super(message)
        this.statuscode = statuscode
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);

    }

}