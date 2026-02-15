import { AdminAuthController } from "../../controllers/implementation/admin/admin.auth.controller";
import { LandlordProfileController } from "../../controllers/implementation/landlord/landlord.profile.controller";


export const DI_TYPES = {
    TenantRepository : Symbol('TenantRepository'),
     TenantAuthService : Symbol('TenantAuthService'),
    TenantProfileService:Symbol('TenantProfileService'),
     TenantAuthController : Symbol('TenantAuthController'),
    TenantProfileController :Symbol('TenantProfileController'),


     LandlordRepository : Symbol('LandlordRepository'),
     LandlordAuthService : Symbol('LandlordAuthService'),
     LandlordProfileService : Symbol('LandlordProfileService'),
     LandlordAuthController : Symbol('LandlordAuthController'),
     LandlordProfileController : Symbol('LandlordProfileController'),

     AdminRepository : Symbol('AdminRepository'),
     AdminAuthService : Symbol('AdminAuthService'),
     AdminAuthController: Symbol('AdminAuthController'),
    
     RedisService : Symbol('RedisService'),
     EmailService : Symbol('EmailService'),
       
   
   
}as const