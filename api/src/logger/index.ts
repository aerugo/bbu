import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import * as path from "path";
import { config } from "../config";

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "cyan",
    debug: "green",
  },
};
winston.addColors(logLevels.colors);

// Custom format for the log
const logFormat = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} - ${level.toUpperCase()} - [${label}] - ${message}`;
});

/**
 * Class wrapper on top of Winston logger.
 */
export class Logger {
  logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }
  error(message: string, params: unknown = undefined): void {
    this.logger.log("error", message + ` ${params ? JSON.stringify(params, null, 2) : ""}`);
  }
  warn(message: string, params: unknown = undefined): void {
    this.logger.log("warn", message + ` ${params ? JSON.stringify(params, null, 2) : ""}`);
  }
  info(message: string, params: unknown = undefined): void {
    this.logger.log("info", message + ` ${params ? JSON.stringify(params, null, 2) : ""}`);
  }
  debug(message: string, params: unknown = undefined): void {
    this.logger.log("debug", message + ` ${params ? JSON.stringify(params, null, 2) : ""}`);
  }
}

/**
 * Create a logger instance.
 */
export function getLogger(label: string): Logger {
  if (!winston.loggers.has(label)) {
    winston.loggers.add(label, {
      levels: logLevels.levels,
      transports: [
        // In console we log everything with colors
        new winston.transports.Console({
          level: config.logs.console_level,
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.label({ label: label }),
            winston.format.timestamp(),
            logFormat,
          ),
        }),
        // There is also a combined log file
        new DailyRotateFile({
          filename: path.join(config.logs.file_path, "application-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          createSymlink: true,
          symlinkName: "application.log",
          zippedArchive: true,
          maxSize: config.logs.file_maxsize,
          maxFiles: config.logs.file_retention,
          level: config.logs.file_level,
          format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp(),
            winston.format.label({ label: label }),
            logFormat,
          ),
        }),
      ],
    });
  }
  return new Logger(winston.loggers.get(label));
}
