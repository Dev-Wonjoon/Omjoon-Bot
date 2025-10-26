import logger from "@core/logger";

export class AppContext {
    private static _instance: AppContext;

    private _backendActive = false;
    private _startupComplete = false;
    private _offlineSince: Date | null = null;

    private constructor() {};

    public static get instance(): AppContext {
        if (!AppContext._instance) {
            AppContext._instance = new AppContext();
        }
        return AppContext._instance;
    }

    get backendActive(): boolean {
        return this._backendActive;
    }

    set backendActive(value: boolean) {
        if (value !== this._backendActive) {
            this._backendActive = value;

            if (!value) {
                this._offlineSince = new Date();
                logger.warn("Backend marked as inactive (offline mode)");
            } else {
                const downtime = this._offlineSince
                    ? `${((Date.now() - this._offlineSince.getTime()) / 1000).toFixed(1)}s`
                    : "unkown";
                logger.info(`Backend restored after ${downtime}`);
                this._offlineSince = null;
            }
        }
    }

    get startupComplete(): boolean {
        return this._startupComplete;
    }

    set startupComplete(value: boolean) {
        if (value !== this._startupComplete) {
            this._startupComplete = value;
            logger.info(
                value
                    ? "Application startup complete"
                    : "Applcation startup reset"
            );
        }
    }

    get status(): "ONLINE" | "OFFLINE" {
        return this._backendActive ? "ONLINE" : "OFFLINE";
    }

    printStatus(): void {
        logger.info(
            `Application Status -> {  }`
        )
    }
}

export const appContext = AppContext.instance;