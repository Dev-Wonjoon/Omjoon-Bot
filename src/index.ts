import { createApp } from "./app";
import logger from './config/logger';

(async () => {
    try {
        await createApp();
    } catch (error) {
        logger.error(`봇 실행 중 오류 발생: ${error}`);
        process.exit(1);
    }
})();

process.on("unhandledRejection", (reason) => {
    logger.error(`[Unhandled Rejection] ${reason}`);
});

process.on("uncaughtException", (error) => {
    logger.error(`[Uncaught Exception] ${error.message}`);
    logger.error(error.stack || "");
    process.exit(1);
});

process.on("SIGINT", () => {
    logger.info("");
    process.exit(0);
});