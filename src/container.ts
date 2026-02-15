 import { container } from "tsyringe";
import { DI_TYPES } from "./common/di/types"; 

import { TenantRepository } from "./repositories/implementation/tenant/tenantRepository";


import { TenantAuthService } from "./services/implemenation/tenant/tenant.auth.service";
import { RedisService } from "./services/implemenation/redisService";
import { EmailService } from "./services/implemenation/emailService";
import { LandlordRepository } from "./repositories/implementation/landlord/landlordRepository";
import { AdminRepository } from "./repositories/implementation/admin/adminRepository";
import { tenantProfileService } from "./services/implemenation/tenant/tenant.profile.service";
import { TenantAuthController } from "./controllers/implementation/tenant/tenantAuthController";
import { TenantProfileController } from "./controllers/implementation/tenant/tenantProfileController";
import { LandlordAuthService } from "./services/implemenation/landlord/landlord.auth.service";
import { LandlordProfileService } from "./services/implemenation/landlord/landlord.profile.service";
import { LandlordAuthController } from "./controllers/implementation/landlord/landlod.auth.controller";
import { LandlordProfileController } from "./controllers/implementation/landlord/landlord.profile.controller";
import { AdminAuthController } from "./controllers/implementation/admin/admin.auth.controller";
import { AdminAuthService } from "./services/implemenation/admin/admin.auth.service";



// ===== Bind Repositories =====
container.registerSingleton(DI_TYPES.TenantRepository,TenantRepository)
container.registerSingleton(DI_TYPES.LandlordRepository, LandlordRepository);
container.registerSingleton(DI_TYPES.AdminRepository,AdminRepository)

// ===== Bind Services =====
container.registerSingleton(DI_TYPES.TenantAuthService,TenantAuthService)
container.registerSingleton(DI_TYPES.TenantProfileService,tenantProfileService)

container.registerSingleton(DI_TYPES.LandlordAuthService,LandlordAuthService)
container.registerSingleton(DI_TYPES.LandlordProfileService,LandlordProfileService)


container.registerSingleton(DI_TYPES.AdminAuthService,AdminAuthService)










container.registerSingleton(DI_TYPES.RedisService,RedisService)
container.registerSingleton(DI_TYPES.EmailService,EmailService)


// ===== Bind Controllers =====
container.registerSingleton(DI_TYPES.TenantAuthController,TenantAuthController)
container.registerSingleton(DI_TYPES.TenantProfileController,TenantProfileController)
container.registerSingleton(DI_TYPES.LandlordAuthController,LandlordAuthController)
container.registerSingleton(DI_TYPES.LandlordProfileController,LandlordProfileController)
container.registerSingleton(DI_TYPES.AdminAuthController,AdminAuthController)

export default container;
