import mongoose from 'mongoose'
import {ENV} from './env'

export const connectDb =async ()=>{
    try {
        await mongoose.connect(ENV.MONGO_URI)
        console.log("mongodb connected successfully")
        
    } catch (error) {
        console.error("mongodb connection failed",error)
        process.exit(1)
    }

}