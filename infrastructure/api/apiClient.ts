import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import logger from "@core/logger";
import { ENV } from "@core/env";
import { appContext } from "@core/appContext";

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.API_ROOT_URL ?? "unknown",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {

    if(!appContext.backendActive) {
        const message = "Backend is currently offline - request blocked.";
        logger.warn(`[Offline Mode] ${config.method?.toUpperCase()} ${config.url}`);
        return Promise.reject(new Error(message));
    }

    config.headers = config.headers ?? {};
    const token = ENV.DISCORD_TOKEN;
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    logger.debug(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
})

apiClient.interceptors.response.use(
    (response) => {
        logger.debug(`[Response] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data ?? error.message;

        if(error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
            if(appContext.backendActive) {
                appContext.backendActive = false;
                logger.warn("[Backend Offline] Connection lost. Switching to offline mode.");
            }
        }

        logger.error(`[Response Error] Status: ${status ?? "N/A"} | Message: ${message}`);
        return Promise.reject(error);
    }
);

export default apiClient;