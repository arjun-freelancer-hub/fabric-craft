import fs from 'fs';
import path from 'path';

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

export class Logger {
    private logLevel: LogLevel;
    private logFile: string;

    constructor() {
        this.logLevel = this.parseLogLevel();
        this.logFile = process.env.LOG_FILE || './logs/app.log';
        this.ensureLogDirectory();
    }

    private parseLogLevel(): LogLevel {
        const level = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
        switch (level) {
            case 'ERROR':
                return LogLevel.ERROR;
            case 'WARN':
                return LogLevel.WARN;
            case 'INFO':
                return LogLevel.INFO;
            case 'DEBUG':
                return LogLevel.DEBUG;
            default:
                return LogLevel.INFO;
        }
    }

    private ensureLogDirectory(): void {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') : '';

        return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
    }

    private writeToFile(message: string): void {
        if (process.env.NODE_ENV !== 'test') {
            fs.appendFileSync(this.logFile, message + '\n');
        }
    }

    private log(level: LogLevel, levelName: string, message: string, ...args: any[]): void {
        if (level <= this.logLevel) {
            const formattedMessage = this.formatMessage(levelName, message, ...args);

            // Console output
            switch (level) {
                case LogLevel.ERROR:
                    console.error(formattedMessage);
                    break;
                case LogLevel.WARN:
                    console.warn(formattedMessage);
                    break;
                case LogLevel.INFO:
                    console.info(formattedMessage);
                    break;
                case LogLevel.DEBUG:
                    console.debug(formattedMessage);
                    break;
            }

            // File output
            this.writeToFile(formattedMessage);
        }
    }

    public error(message: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, 'ERROR', message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.log(LogLevel.WARN, 'WARN', message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this.log(LogLevel.INFO, 'INFO', message, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public getLogLevel(): LogLevel {
        return this.logLevel;
    }
}
