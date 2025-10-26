import axios from "axios";
import logger from "../../core/logger";
import { appContext } from "@core/appContext";
import { ENV } from "@core/env";

const BASE_INTERVAL = 30_000;
const MAX_INTERVAL = 5 * 60_000;
const ERROR_THRESHOLD = 3;
const RATE_WINDOW = 60_000;

let currentInterval = BASE_INTERVAL;
let recentErrors: number[] = [];
let consecutiveErrors = 0;
let isMonitoring = false;

async function checkBackendStatus(): Promise<void> {
    try {
        const res = await axios.get(`${ENV.API_ROOT_URL}/health`, {
            timeout: 5000,
        });

        if (res.status === 200) {
            if (appContext.backendActive === false) {
                logger.info("Backend is reachable again.");
            }
            appContext.backendActive = true;
            consecutiveErrors = 0;
            recentErrors = [];
            currentInterval = BASE_INTERVAL;
        } else {
            throw new Error(`Unexpected status code: ${res.status}`);
        }
    } catch (error: any) {
        const now = Date.now();
        recentErrors.push(now);
        recentErrors = recentErrors.filter((t) => now - t < RATE_WINDOW);
        consecutiveErrors++;

        logger.warn(`Backend check failed (${consecutiveErrors} consecutive errors): ${error.message}`);

        if (recentErrors.length >= ERROR_THRESHOLD) {
            if (appContext.backendActive !== false) {
                logger.error(`Backend is considered unreachable after ${recentErrors.length} error within ${RATE_WINDOW / 1000}s`);
            }
            appContext.backendActive = false;
        }
        currentInterval = Math.min(currentInterval * 2, MAX_INTERVAL);
    }
}

export function startBackendMonitor(): void {
    if (isMonitoring) return;
    isMonitoring = true;

    logger.info("Starting backend monitoring loop...");

    const monitorLoop = async () => {
        await checkBackendStatus();
        setTimeout(monitorLoop, currentInterval);
    };

    monitorLoop();
}