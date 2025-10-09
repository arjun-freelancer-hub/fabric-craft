export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export declare class Logger {
    private logLevel;
    private logFile;
    constructor();
    private parseLogLevel;
    private ensureLogDirectory;
    private formatMessage;
    private writeToFile;
    private log;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    setLogLevel(level: LogLevel): void;
    getLogLevel(): LogLevel;
}
//# sourceMappingURL=Logger.d.ts.map