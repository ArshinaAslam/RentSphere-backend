import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
export const uploadImage = multer({
 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Image files only') as unknown as null, false);
  },
});


// ✅ Multiple file upload middleware
export const uploadKycImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('JPG, PNG, PDF only') as any, false);
  },
}).fields([
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]);


// export const uploadDocument = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowed = ['application/pdf', 'application/msword'];
//     if (allowed.includes(file.mimetype)) cb(null, true);
//     else cb(new Error('Only PDF/DOC'), false);
//   },
// });



// export const uploadKyc = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 },  // 10MB for KYC
//   fileFilter: (req, file, cb) => {
//     const allowed = ['image/jpeg', 'image/png', 'image/pdf', 'application/pdf'];
//     if (allowed.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('KYC: JPG/PNG/PDF only') as any, false);
//     }
//   },
// });





