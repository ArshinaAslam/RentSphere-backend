import "reflect-metadata";   
import "./container"; 
import app from './app'
import {connectDb} from './config/db'
import {ENV} from './config/env'

connectDb();

app.listen(ENV.PORT,()=>{
    console.log(`Server running on port ${ENV.PORT}`)
})