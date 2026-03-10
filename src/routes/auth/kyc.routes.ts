// import Router from "express";
// import { container } from "tsyringe";

// import { uploadMultipleImages } from "../../config/multer";
// import { LandlordKycController } from "../../controllers/implementation/landlord/landlord.kyc.controller";
// import { asyncHandler } from "../../middleware/asyncHandler";

// const router = Router();

// const landlordKycController = container.resolve(LandlordKycController);

// router.post(
//   "/landlord/kyc-submit",
//   uploadMultipleImages,
//   landlordKycController.submitLandlordKyc.bind(landlordKycController),
// );

// router.get(
//   "/landlord/kyc-status",

//   asyncHandler(landlordKycController.getKycStatus.bind(landlordKycController)),
// );

// export default router;
