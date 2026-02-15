import "reflect-metadata";   
import "./container"; 
import app from './app'
import {connectDb} from './config/db'
import {ENV} from './config/env'



connectDb()
    .then(() => {
        app.listen(ENV.PORT, ()=>{
            console.log(`Server running on port ${ENV.PORT}`)
        })
    })
    .catch((error) => {
        console.error("Failed to start server:", error);
        process.exit(1);
    });