 import { container } from "tsyringe";
import { DI_TYPES } from "../../common/di/types"; 
import { AuthController } from "../../modules/auth/controllers/impelmenation/AuthController";
import { AuthService } from "../../modules/auth/services/implementation/AuthService";
import { TenantRepository } from "../../shared/repositories/implementation/tenantRepository";
import { RedisService } from "../../modules/auth/services/implementation/redisService";
import { EmailService } from "../../modules/auth/services/implementation/emailService";
import { LandlordRepository } from "../../shared/repositories/implementation/landlordRepository";
import { AdminRepository } from "../../modules/auth/repositories/implementation/Admin.repository";


container.registerSingleton(DI_TYPES.TenantRepository,TenantRepository)
container.registerSingleton(DI_TYPES.AuthService,AuthService)
container.registerSingleton(DI_TYPES.RedisService,RedisService)
container.registerSingleton(DI_TYPES.EmailService, EmailService)
container.registerSingleton(DI_TYPES.LandlordRepository, LandlordRepository);
container.registerSingleton(DI_TYPES.AdminRepository,AdminRepository)



export const authController = container.resolve(AuthController)
