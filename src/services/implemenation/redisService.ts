
import Redis from 'ioredis'
import {ENV} from '../../config/env'
import { injectable } from 'tsyringe';
import { IRedisService } from '../interface/IRedisService';

@injectable()
export class RedisService implements IRedisService{
     private client:Redis;
    constructor(){
      this.client = new Redis(ENV.REDIS_URL)
      this.client.on("error", (err) => {
         console.error("Redis connection error:", err);
       });

    }

   async setOtp(email:string,otp:string,ttlSeconds:number=60):Promise<void>{
    await this.client.setex(`otp:${email}`,ttlSeconds,otp)
   }

   async getOtp(email:string):Promise<string | null>{
      return this.client.get(`otp:${email}`)
   }

   async deleteOtp(email:string):Promise<void>{
    await this.client.del(`otp:${email}`)
   }

   async setResendLock(email:string,ttlSeconds:number=60):Promise<void>{
     await this.client.setex(`otp:resend_lock:${email}`,ttlSeconds,"locked")
   }

   async canResendOtp(email:string):Promise<boolean>{
    const exists = await this.client.get(`otp:resend_lock:${email}`)
    return !exists
   }

}