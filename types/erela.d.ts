import 'erela.js';

declare module 'erela.js' {
    interface Player {
        on(event: string, listener: (...args: any[]) => void): this;
        off(event: string, listener: (...args: any[]) => void): this;
    }
}