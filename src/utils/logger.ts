import path from "path";

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const LOG_DIR = path.join(__dirname, "..", "..", "logs");

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    const stackStr = typeof stack === "string" ? `\n${stack}` : "";

    return `[${String(timestamp)}] ${level.toUpperCase()}: ${String(message)} ${metaStr}${stackStr}`;
  }),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `[${String(timestamp)}] ${level}: ${String(message)} ${metaStr}`;
  }),
);

const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  silent: process.env.NODE_ENV === "test",
});

const allLogsTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: "application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",
  format: logFormat,
  zippedArchive: true,
});

const errorLogsTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  level: "error",
  format: logFormat,
  zippedArchive: true,
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [consoleTransport, allLogsTransport, errorLogsTransport],
});

export default logger;
