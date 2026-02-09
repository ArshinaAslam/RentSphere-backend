

export const DI_TYPES = {
    AuthService : Symbol('AuthService'),
    TenantRepository : Symbol('TenantRepository'),
    RedisService : Symbol('RedisService'),
    EmailService : Symbol('EmailService'),
    LandlordRepository : Symbol('LandlordRepository'),
    AdminRepository : Symbol('AdminRepository'),
    UserService: Symbol('UserService'),
    UserRepository:Symbol('UserRepository')
}as const