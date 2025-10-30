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

const isProd = process.env.NODE_ENV === "production";

const baseFormats = [
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss"}),
    winston.format.errors({ stack: true }),
    !isProd ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
    logFormat
];

const logger = winston.createLogger({
    level: isProd ? "info" : "debug",
    format: winston.format.combine(...baseFormats),
    transports: [
        new winston.transports.Console(),
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
