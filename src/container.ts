import { container } from "tsyringe";

import { DI_TYPES } from "./common/di/types";
import { AdminAuthController } from "./controllers/admin/admin.auth.controller";
import { AdminLandlordController } from "./controllers/admin/admin.landlord.controller";
import { AdminTenantController } from "./controllers/admin/admin.tenant.controller";
import { LandlordKycController } from "./controllers/landlord/landlord.kyc.controller";
import { LandlordProfileController } from "./controllers/landlord/landlord.profile.controller";
import { LandlordPropertyController } from "./controllers/landlord/landlord.property.controller";
import { LandlordVisitController } from "./controllers/landlord/landlord.visit.controller";
import { TenantProfileController } from "./controllers/tenant/tenant.profile.controller";
import { TenantPropertyController } from "./controllers/tenant/tenant.property.controller";
import { TenantVisitController } from "./controllers/tenant/tenant.visit.controller";
import { AdminRepository } from "./repositories/implementation/admin.repository";
import { AmenityRepository } from "./repositories/implementation/amenity.repository";
import { ConversationRepository } from "./repositories/implementation/conversation.repository";
import { InquiryRepository } from "./repositories/implementation/inquiry.repository";
import { LandlordRepository } from "./repositories/implementation/landlord.repository";
import { LeaseRepository } from "./repositories/implementation/lease.repository";
import { MessageRepository } from "./repositories/implementation/message.repository";
import { NotificationRepository } from "./repositories/implementation/notification.repository";
import { PaymentRepository } from "./repositories/implementation/payment.repository";
import { PropertyRepository } from "./repositories/implementation/property.repository";
import { PropertyTypeRepository } from "./repositories/implementation/propertyType.repository";
import { ReviewRepository } from "./repositories/implementation/review.repository";
import { TenantRepository } from "./repositories/implementation/tenant.repository";
import { VisitBookingRepository } from "./repositories/implementation/visitBooking.repository";
import { WishlistRepository } from "./repositories/implementation/wishlist.repository";
import AdminAmenityService from "./services/implemenation/admin/admin.amenityTye.service";
import { AdminAuthService } from "./services/implemenation/admin/admin.auth.service";
import AdminLandlordService from "./services/implemenation/admin/admin.landlord.service";
import AdminPropertyService from "./services/implemenation/admin/admin.property.service";
import AdminPropertyTypeService from "./services/implemenation/admin/admin.propertyType.service";
import AdminRevenueService from "./services/implemenation/admin/admin.revenue.service";
import AdminTenantService from "./services/implemenation/admin/admin.tenant.service";
import { AuthService } from "./services/implemenation/auth/auth.service";
import { ChatService } from "./services/implemenation/chat/chat.service";
import { EmailService } from "./services/implemenation/emailService";
import LandlordAmenityService from "./services/implemenation/landlord/landlord.amenity.service";
import { LandlordInquiryService } from "./services/implemenation/landlord/landlord.inquiry.service";
import { LandlordKycService } from "./services/implemenation/landlord/landlord.kyc.service";
import { LandlordLeaseService } from "./services/implemenation/landlord/landlord.lease.service";
import { LandlordPaymentService } from "./services/implemenation/landlord/landlord.payment.service";
import { LandlordProfileService } from "./services/implemenation/landlord/landlord.profile.service";
import { LandlordPropertyService } from "./services/implemenation/landlord/landlord.property.service";
import LandlordPropertyTypeService from "./services/implemenation/landlord/landlord.propertyType.service";
import { LandlordVisitService } from "./services/implemenation/landlord/landlord.visit.service";
import { NotificationService } from "./services/implemenation/notification/notification.service";
import { RedisService } from "./services/implemenation/redisService";
import { TenantInquiryService } from "./services/implemenation/tenant/tenant.inquiry.service";
import { TenantLeaseService } from "./services/implemenation/tenant/tenant.lease.service";
import { TenantPaymentService } from "./services/implemenation/tenant/tenant.payment.service";
import { tenantProfileService } from "./services/implemenation/tenant/tenant.profile.service";
import { TenantPropertyService } from "./services/implemenation/tenant/tenant.property.service";
import { TenantReviewService } from "./services/implemenation/tenant/tenant.review.service";
import { TenantVisitService } from "./services/implemenation/tenant/tenant.visit.service";
import { TenantWishlistService } from "./services/implemenation/tenant/tenant.wishlist.service";

// ===== Bind Repositories =====
container.registerSingleton(DI_TYPES.TenantRepository, TenantRepository);
container.registerSingleton(DI_TYPES.LandlordRepository, LandlordRepository);
container.registerSingleton(DI_TYPES.AdminRepository, AdminRepository);

container.registerInstance(DI_TYPES.UserRepoMap, {
  TENANT: container.resolve(DI_TYPES.TenantRepository),
  LANDLORD: container.resolve(DI_TYPES.LandlordRepository),
});

container.registerSingleton(DI_TYPES.PropertyRepository, PropertyRepository);
container.registerSingleton(
  DI_TYPES.VisitBookingRepository,
  VisitBookingRepository,
);

container.registerSingleton(DI_TYPES.InquiryRepository, InquiryRepository);
container.registerSingleton(DI_TYPES.WishlistRepository, WishlistRepository);
container.registerSingleton(DI_TYPES.PaymentRepository, PaymentRepository);

container.registerSingleton(
  DI_TYPES.ConversationRepository,
  ConversationRepository,
);
container.registerSingleton(DI_TYPES.MessageRepository, MessageRepository);
container.registerSingleton(DI_TYPES.LeaseRepository, LeaseRepository);
container.registerSingleton(
  DI_TYPES.NotificationRepository,
  NotificationRepository,
);
container.registerSingleton(DI_TYPES.ReviewRepository, ReviewRepository);
container.register(DI_TYPES.PropertyTypeRepository, PropertyTypeRepository);
container.register(DI_TYPES.AmenityRepository, AmenityRepository);

// ===== Bind Services =====
container.registerSingleton(DI_TYPES.AuthService, AuthService);

container.registerSingleton(
  DI_TYPES.TenantProfileService,
  tenantProfileService,
);
container.registerSingleton(
  DI_TYPES.TenantPropertyService,
  TenantPropertyService,
);
container.registerSingleton(DI_TYPES.VisitBookingService, TenantVisitService);
container.registerSingleton(
  DI_TYPES.TenantInquiryService,
  TenantInquiryService,
);
container.registerSingleton(
  DI_TYPES.TenantWishlistService,
  TenantWishlistService,
);
container.registerSingleton(DI_TYPES.ChatService, ChatService);
container.registerSingleton(DI_TYPES.NotificationService, NotificationService);

container.registerSingleton(DI_TYPES.TenantLeaseService, TenantLeaseService);
container.registerSingleton(
  DI_TYPES.TenantPaymentService,
  TenantPaymentService,
);
container.registerSingleton(DI_TYPES.TenantReviewService, TenantReviewService);

container.registerSingleton(
  DI_TYPES.LandlordPaymentService,
  LandlordPaymentService,
);

container.registerSingleton(
  DI_TYPES.LandlordProfileService,
  LandlordProfileService,
);
container.registerSingleton(DI_TYPES.LandlordKycService, LandlordKycService);
container.registerSingleton(
  DI_TYPES.LandlordPropertyService,
  LandlordPropertyService,
);
container.registerSingleton(
  DI_TYPES.LandlordVisitService,
  LandlordVisitService,
);
container.registerSingleton(
  DI_TYPES.LandlordInquiryService,
  LandlordInquiryService,
);
container.registerSingleton(
  DI_TYPES.LandlordLeaseService,
  LandlordLeaseService,
);
container.registerSingleton(
  DI_TYPES.LandlordPropertyTypeService,
  LandlordPropertyTypeService,
);
container.registerSingleton(
  DI_TYPES.LandlordAmenityService,
  LandlordAmenityService,
);

container.registerSingleton(DI_TYPES.AdminAuthService, AdminAuthService);
container.registerSingleton(DI_TYPES.AdminTenantService, AdminTenantService);
container.registerSingleton(
  DI_TYPES.AdminLandlordService,
  AdminLandlordService,
);
container.register(DI_TYPES.AdminPropertyTypeService, AdminPropertyTypeService);
container.register(DI_TYPES.AdminAmenityService, AdminAmenityService);
container.registerSingleton(DI_TYPES.AdminRevenueService, AdminRevenueService);

container.registerSingleton(DI_TYPES.RedisService, RedisService);
container.registerSingleton(DI_TYPES.EmailService, EmailService);
container.register(DI_TYPES.AdminPropertyService, AdminPropertyService);

// // ===== Bind Controllers =====

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
container.registerSingleton(
  DI_TYPES.LandlordVisitController,
  LandlordVisitController,
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
