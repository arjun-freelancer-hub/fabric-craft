"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.logLevel = this.parseLogLevel();
        this.logFile = process.env.LOG_FILE || './logs/app.log';
        this.ensureLogDirectory();
    }
    parseLogLevel() {
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
    ensureLogDirectory() {
        const logDir = path_1.default.dirname(this.logFile);
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir, { recursive: true });
        }
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') : '';
        return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
    }
    writeToFile(message) {
        if (process.env.NODE_ENV !== 'test') {
            fs_1.default.appendFileSync(this.logFile, message + '\n');
        }
    }
    log(level, levelName, message, ...args) {
        if (level <= this.logLevel) {
            const formattedMessage = this.formatMessage(levelName, message, ...args);
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
            this.writeToFile(formattedMessage);
        }
    }
    error(message, ...args) {
        this.log(LogLevel.ERROR, 'ERROR', message, ...args);
    }
    warn(message, ...args) {
        this.log(LogLevel.WARN, 'WARN', message, ...args);
    }
    info(message, ...args) {
        this.log(LogLevel.INFO, 'INFO', message, ...args);
    }
    debug(message, ...args) {
        this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    getLogLevel() {
        return this.logLevel;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map