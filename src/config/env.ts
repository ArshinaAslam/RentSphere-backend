
import dotenv from 'dotenv';
dotenv.config();

function getEnv(key:string):string{
   const value = process.env[key];
   if(!value){
    throw new Error(`Missing environment variable: ${key}`);
   }
   return value;

}



export const ENV = {
    PORT : process.env.PORT,
    MONGO_URI : getEnv("MONGO_URI"),
    REDIS_URL : getEnv("REDIS_URL"),
    SMTP_HOST : getEnv("SMTP_HOST"),
    SMTP_USER : getEnv("SMTP_USER"),
    SMTP_PASS : getEnv("SMTP_PASS"),
    JWT_ACCESS_SECRET:getEnv("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    GOOGLE_CLIENT_ID:getEnv("GOOGLE_CLIENT_ID"),
    AWS_ACCESS_KEY_ID: getEnv("AWS_ACCESS_KEY_ID"),
AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY"),
AWS_REGION: getEnv("AWS_REGION"),
AWS_S3_BUCKET: getEnv("AWS_S3_BUCKET"),
    
     


};





