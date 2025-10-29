import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { fileURLToPath } from "url";

function getCallerFile() {
    try {
        const error = new Error();
        const stack = error?.stack?.split('\n')[3];
        if (!stack) return 'App';
        const match = stack.match(/\((.*):\d+:\d+\)/);
        if (!match) return 'App';
        return path.basename(match[1]);
    } catch {
        return 'App';
    }
}

const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
    const threadName = process.title || 'main';
    const className = getCallerFile();
    const levelPadded = level.toUpperCase().padEnd(5, ' ');
    const msg = stack || message;
    return `${timestamp} [${levelPadded}] [${threadName}] ${className} - ${msg}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss"}),
        winston.format.errors({ stack: true }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format:
                process.env.NODE_ENV === "production"
                ? winston.format.simple()
                : winston.format.combine(
                    winston.format.colorize({ all: true }),
                    winston.format.simple()
                ),
        }),
        new DailyRotateFile({
            dirname: "logs",
            filename: "bot-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxFiles: "7d",
            level: "info",
        }),
    ],
});

logger.exceptions.handle(
    new winston.transports.File({ filename: "logs/exceptions.log"})
)

logger.rejections.handle(
    new winston.transports.File({ filename: "logs/rejections.log" })
)

export default logger;