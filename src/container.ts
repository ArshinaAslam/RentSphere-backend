import { container } from "tsyringe";

import { DI_TYPES } from "./common/di/types";
import { AdminAuthController } from "./controllers/implementation/admin/admin.auth.controller";
import { AdminLandlordController } from "./controllers/implementation/admin/admin.landlord.controller";
import { AdminTenantController } from "./controllers/implementation/admin/admin.tenant.controller";
import { LandlordKycController } from "./controllers/implementation/landlord/landlord.kyc.controller";
import { LandlordProfileController } from "./controllers/implementation/landlord/landlord.profile.controller";
import { LandlordPropertyController } from "./controllers/implementation/landlord/landlord.property.controller";
import { TenantProfileController } from "./controllers/implementation/tenant/tenant.profile.controller";
import { TenantPropertyController } from "./controllers/implementation/tenant/tenant.property.controller";
import { TenantVisitController } from "./controllers/implementation/tenant/tenant.visit.controller";
import { AdminRepository } from "./repositories/implementation/admin/adminRepository";
import { LandlordRepository } from "./repositories/implementation/landlord/landlordRepository";
import { PropertyRepository } from "./repositories/implementation/property.repository";
import { TenantRepository } from "./repositories/implementation/tenant/tenantRepository";
import { VisitBookingRepository } from "./repositories/implementation/visitBooking.repository";
import { AdminAuthService } from "./services/implemenation/admin/admin.auth.service";
import AdminLandlordService from "./services/implemenation/admin/admin.landlord.service";
import AdminTenantService from "./services/implemenation/admin/admin.tenant.service";
import { AuthService } from "./services/implemenation/auth/authService";
import { EmailService } from "./services/implemenation/emailService";
import { LandlordKycService } from "./services/implemenation/landlord/landlord.kyc.service";
import { LandlordProfileService } from "./services/implemenation/landlord/landlord.profile.service";
import { LandlordPropertyService } from "./services/implemenation/landlord/landlord.property.service";
import { RedisService } from "./services/implemenation/redisService";
import { tenantProfileService } from "./services/implemenation/tenant/tenant.profile.service";
import { TenantPropertyService } from "./services/implemenation/tenant/tenant.property.service";
import { TenantVisitService } from "./services/implemenation/tenant/tenant.visit.service";

// ===== Bind Repositories =====
container.registerSingleton(DI_TYPES.TenantRepository, TenantRepository);
container.registerSingleton(DI_TYPES.LandlordRepository, LandlordRepository);
container.registerSingleton(DI_TYPES.AdminRepository, AdminRepository);

container.registerInstance(DI_TYPES.UserRepoMap, {
  TENANT: container.resolve(DI_TYPES.TenantRepository),
  LANDLORD: container.resolve(DI_TYPES.LandlordRepository),
  //   ADMIN: container.resolve(DI_TYPES.AdminRepository),
});

container.registerSingleton(DI_TYPES.PropertyRepository, PropertyRepository);
container.registerSingleton(
  DI_TYPES.VisitBookingRepository,
  VisitBookingRepository,
);

// ===== Bind Services =====
container.registerSingleton(DI_TYPES.AuthService, AuthService);

// container.registerSingleton(DI_TYPES.TenantAuthService,TenantAuthService)
container.registerSingleton(
  DI_TYPES.TenantProfileService,
  tenantProfileService,
);
container.registerSingleton(
  DI_TYPES.TenantPropertyService,
  TenantPropertyService,
);
container.registerSingleton(DI_TYPES.VisitBookingService, TenantVisitService);

// container.registerSingleton(DI_TYPES.LandlordAuthService,LandlordAuthService)
container.registerSingleton(
  DI_TYPES.LandlordProfileService,
  LandlordProfileService,
);
container.registerSingleton(DI_TYPES.LandlordKycService, LandlordKycService);
container.registerSingleton(
  DI_TYPES.LandlordPropertyService,
  LandlordPropertyService,
);

container.registerSingleton(DI_TYPES.AdminAuthService, AdminAuthService);
container.registerSingleton(DI_TYPES.AdminTenantService, AdminTenantService);
container.registerSingleton(
  DI_TYPES.AdminLandlordService,
  AdminLandlordService,
);

container.registerSingleton(DI_TYPES.RedisService, RedisService);
container.registerSingleton(DI_TYPES.EmailService, EmailService);

// // ===== Bind Controllers =====
// container.registerSingleton(DI_TYPES.TenantAuthController,TenantAuthController)
container.registerSingleton(
  DI_TYPES.TenantProfileController,
  TenantProfileController,
);
container.registerSingleton(
  DI_TYPES.TenantPropertyController,
  TenantPropertyController,
);
container.registerSingleton(
  DI_TYPES.TenantVisitController,
  TenantVisitController,
);
// container.registerSingleton(DI_TYPES.LandlordAuthController,LandlordAuthController)
container.registerSingleton(
  DI_TYPES.LandlordProfileController,
  LandlordProfileController,
);
container.registerSingleton(
  DI_TYPES.LandlordKycController,
  LandlordKycController,
);
container.registerSingleton(
  DI_TYPES.LandlordPropertyController,
  LandlordPropertyController,
);
container.registerSingleton(DI_TYPES.AdminAuthController, AdminAuthController);
container.registerSingleton(
  DI_TYPES.AdminTenantController,
  AdminTenantController,
);
container.registerSingleton(
  DI_TYPES.AdminLandlordController,
  AdminLandlordController,
);

export default container;
