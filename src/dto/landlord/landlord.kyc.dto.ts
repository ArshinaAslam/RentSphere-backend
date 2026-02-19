


export type KycFiles = {
  aadhaarFront?: Express.Multer.File[];
  aadhaarBack?: Express.Multer.File[];
  panCard?: Express.Multer.File[];
  selfie?: Express.Multer.File[];
};


export interface SubmitLandlordKycDto {
  email: string;
  aadhaarNumber: string;
  panNumber: string;
  files: {
    aadhaarFront: Express.Multer.File | null;
    aadhaarBack: Express.Multer.File | null;
    panCard: Express.Multer.File | null;
    selfie: Express.Multer.File | null;
  };
}





export interface SubmitKycDto {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  files: {
    aadhaarFront: Express.Multer.File | null;
    aadhaarBack: Express.Multer.File | null;
    panCard: Express.Multer.File | null;
    liveSelfie: Express.Multer.File | null;
  };
}



export interface getKycStatusDto{
  email:string;
}

