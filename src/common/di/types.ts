

export const DI_TYPES = {
    TenantRepository : Symbol('TenantRepository'),
     TenantAuthService : Symbol('TenantAuthService'),
    TenantProfileService:Symbol('TenantProfileService'),
     TenantAuthController : Symbol('TenantAuthController'),
    TenantProfileController :Symbol('TenantProfileController'),


     LandlordRepository : Symbol('LandlordRepository'),
     LandlordAuthService : Symbol('LandlordAuthService'),
     LandlordKycService : Symbol('LandlordKycService'),
     LandlordProfileService : Symbol('LandlordProfileService'),
     LandlordAuthController : Symbol('LandlordAuthController'),
     LandlordProfileController : Symbol('LandlordProfileController'),
     LandlordKycController : Symbol('LandlordKycController'),

     AdminRepository : Symbol('AdminRepository'),
     AdminAuthService : Symbol('AdminAuthService'),
     AdminTenantService : Symbol('AdminTenantService'),
     AdminLandlordService : Symbol('AdminLandlordService'),
     AdminAuthController: Symbol('AdminAuthController'),
     AdminTenantController : Symbol('AdminTenantController'),
     AdminLandlordController : Symbol('AdminLandlordController'),
    
     RedisService : Symbol('RedisService'),
     EmailService : Symbol('EmailService'),
     AuthService : Symbol('AuthService'),
     UserRepoMap : Symbol('UserRepoMap')
   
   
}as const