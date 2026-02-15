
// import winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';


// const logger = winston.createLogger({
//   level:  'info',
//   format: winston.format.combine(
//     winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     winston.format.errors({ stack: true }),
    
    
//     process.env.NODE_ENV !== 'production' 
//       ? winston.format.simple()
//       : winston.format.json()
//   ),
  
//   transports: [
//     //Console
//     // new winston.transports.Console(),
    
//     //Daily log files
//     new DailyRotateFile({
//       filename: 'logs/application-%DATE%.log',
//       datePattern: 'YYYY-MM-DD',
//       zippedArchive: true,
//       maxSize: '20m',
//       maxFiles: '14d',
//       level: 'info'
//     }),
    
//     //Errors only
//     new DailyRotateFile({
//       filename: 'logs/error-%DATE%.log',
//       datePattern: 'YYYY-MM-DD',
//       level: 'error',
//       maxFiles: '30d'
//     })
//   ]
// });

// export default logger;



import path from 'path';
import fs from 'fs';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
console.log("working wasdfbnmfgc vhjjj")
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    new DailyRotateFile({
      dirname: logsDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }),

    new DailyRotateFile({
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    })
  ]
});

export default logger;