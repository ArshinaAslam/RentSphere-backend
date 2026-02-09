//  import { container } from "tsyringe";
// import { DI_TYPES } from "./common/di/types"; 
// import { AuthController } from "./modules/auth/controllers/impelmenation/AuthController";
// import { AuthService } from "./modules/auth/services/implementation/AuthService";
// import { UserRepository } from "./modules/auth/repositories/implementation/TenantRepository";
// import { RedisService } from "./modules/auth/services/implementation/redisService";
// import { EmailService } from "./modules/auth/services/implementation/emailService";
// import { LandlordRepository } from "./modules/auth/repositories/implementation/LandlordRepository";
// import { AdminRepository } from "./modules/auth/repositories/implementation/Admin.repository";
// import UserService from "./modules/user/services/implementation/UserService";

// container.registerSingleton(DI_TYPES.UserRepository,UserRepository)
// container.registerSingleton(DI_TYPES.AuthService,AuthService)
// container.registerSingleton(DI_TYPES.RedisService,RedisService)
// container.registerSingleton(DI_TYPES.EmailService, EmailService)
// container.registerSingleton(DI_TYPES.LandlordRepository, LandlordRepository);
// container.registerSingleton(DI_TYPES.AdminRepository,AdminRepository)


// // Add to your existing container setup:
// container.registerSingleton(DI_TYPES.UserService, UserService);



// export const authController = container.resolve(AuthController)





import './modules/auth/auth.container';
import './modules/user/user.container';



