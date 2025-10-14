import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logFormat = winston.format.printf(({level, message, timestamp}) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss"}),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format:
                process.env.NODE_ENV === "production"
                ? winston.format.simple()
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
        }),
        new DailyRotateFile({
            dirname: "logs",
            filename: "bot-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxFiles: "7d",
            level: "info"
        }),
    ],
});

export default logger;