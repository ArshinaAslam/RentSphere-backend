// import { Request, Response } from "express";
// import { DI_TYPES } from "../../../../common/di/types";
// import { IUserService } from "../../services/interface/IUserService";
// import { injectable, inject } from "tsyringe";
// import { GetLandlordDetailsDto, GetUsersDto, ToggleUserStatusDto } from "../../dto/users.dto";
// import { HttpStatus } from "../../../../common/enums/httpStatus.enum";
// import { MESSAGES } from "../../../../common/constants/statusMessages";
// import { ApiResponses } from "../../../../common/response/ApiResponse";
// import { AppError } from "../../../../common/errors/appError";
// import logger from "../../../../utils/logger";

// @injectable()
// export class UserController {
//   constructor(
//     @inject(DI_TYPES.UserService)
//     private readonly userService: IUserService,
//   ) {}



//   async getTenants(req: Request, res: Response): Promise<Response> {
//     logger.info('Admin tenant list request', { query: req.query, ip: req.ip });

//     const dto: GetUsersDto = {
//       search: req.query.search as string,
//       page: Number(req.query.page) || 1,
//       limit: Number(req.query.limit) || 10,
//     };

//     const data = await this.userService.getTenants(dto);  

//     logger.info('Admin tenant list SUCCESS', { count: data.users.length, total: data.total });
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, MESSAGES.USERS.FETCH_SUCCESS, data)
//     );
//   }

 
//   async getLandlords(req: Request, res: Response): Promise<Response> {
//     logger.info('Admin landlord list request', { query: req.query, ip: req.ip });

//     const dto: GetUsersDto = {
//       search: req.query.search as string,
//       page: Number(req.query.page) || 1,
//       limit: Number(req.query.limit) || 10,
//     };

//     const data = await this.userService.getLandlords(dto);  

//     logger.info('Admin landlord list SUCCESS', { count: data.users.length, total: data.total });
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, MESSAGES.USERS.FETCH_SUCCESS, data)
//     );
//   }




// async getLandlordDetails(req: Request, res: Response): Promise<Response> {
//   console.log("signlecontroller 1",req.params.id)
//   logger.info('Admin single landlord request', { 
//     id: req.params.id, 
//     ip: req.ip 
//   });

//   const dto: GetLandlordDetailsDto = {
//     id: req.params.id as string,
//   };

//   const landlord = await this.userService.getLandlordDetails(dto.id);

//   logger.info('Admin single landlord SUCCESS', { 
//     id: dto.id, 
//     fullName: landlord.fullName 
//   });
//     console.log("signlecontroller 2",landlord)
//   return res.status(HttpStatus.OK).json(
//     new ApiResponses(true, MESSAGES.USERS.FETCH_SUCCESS, landlord)
//   );
// }


//   async toggleUserStatus(req: Request, res: Response): Promise<Response> {
//     console.log("WQEghnj mvvzkjx")
//     const tenantId = req.params.id;
//      console.log("reached for toggle1",tenantId)
//    if (!tenantId) {
//     return res.status(HttpStatus.BAD_REQUEST).json(
//       new ApiResponses(false, "User ID is required", null)
//     );
//   }
//     logger.info('Admin toggle user status request', { 
//       userId: req.params.id,
//       status: req.body.status,
//       ip: req.ip 
//     });
   
//     const dto: ToggleUserStatusDto = {
//       status: req.body.status,
//     };

//     const data = await this.userService.toggleUserStatus(tenantId, dto);

//     logger.info('User status toggle SUCCESS', { 
//       userId: req.params.id,
//       status: data.status 
//     });
//  console.log("data from toggleUserStatusc",data)
//     return res.status(HttpStatus.OK).json(
//       new ApiResponses(true, MESSAGES.USERS.STATUS_UPDATE_SUCCESS, data)
//     );
//   }



  
// async approveLandlordKyc(req: Request, res: Response): Promise<void> {
//   console.log("hello from approve kyc")
//     if (typeof req.params.id !== 'string') {
//     throw new AppError('Invalid landlord ID', HttpStatus.BAD_REQUEST);
//   }
//   const { id } = req.params;
//   console.log("approvekyccontroller1",id)
  
//   logger.info('Admin approving KYC', { landlordId: id });
  
//   const landlord = await this.userService.approveLandlordKyc(id);
  
//   logger.info('KYC approved successfully', { 
//     landlordId: id, 
//     fullName: landlord.fullName 
//   });
//   console.log("approvekyccontroller2",landlord)
//   res.status(HttpStatus.OK).json({
//     success: true,
//     message: 'KYC approved successfully',
//     data: landlord
//   });
// }


// async rejectLandlordKyc(req: Request, res: Response): Promise<void> {
//   console.log("hello from reject kyc")
//    if (typeof req.params.id !== 'string') {
//     throw new AppError('Invalid landlord ID', HttpStatus.BAD_REQUEST);
//   }
//   const { id } = req.params;
//   const { reason } = req.body; 
  
//   logger.info('Admin rejecting KYC', { landlordId: id });
  
//   const landlord = await this.userService.rejectLandlordKyc(id, reason);
  
//   logger.info('KYC rejected successfully', { landlordId: id });
//   console.log("arejectkyccontroller2",landlord)
//   res.status(HttpStatus.OK).json({
//     success: true,
//     message: 'KYC rejected successfully',
//     data: landlord
//   });
// }

// }
