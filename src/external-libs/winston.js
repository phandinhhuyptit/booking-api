/* eslint-disable no-dupe-class-members */
/* eslint-disable camelcase */
import { createLogger, transports, format } from "winston";
require("dotenv").config();

class LoggerService {
  constructor(route, storage) {
    this.log_data = null;
    this.route = route || process.env.LOGGER_ROUTE_NAME;
    this.storage =
      (typeof storage !== "undefined" && storage) ||
      process.env.LOGGER_ROUTE_STORAGE;

    const viewer = [new transports.Console()];
    if (this.storage === "true") {
      viewer.push(
        new transports.File({
          filename: `./logs/${route}.log`
        })
      );
    }
    const logger = createLogger({
      exitOnError: false, // do not exit on handled exceptions
      transports: viewer,
      format: format.combine(
        format.timestamp({
          format: "YYYYMMDD-HH:mm:ss:SSS"
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        format.printf(info => {
          let message = `[${info.timestamp}] | ${route}.log | ${info.level} | ${info.message}`;
          message = info.obj
            ? message + ` | data:${JSON.stringify(info.obj)}`
            : message;
          message = this.log_data
            ? message + ` | log_data:${JSON.stringify(this.log_data)}`
            : message;
          return message;
        })
      )
    });
    this.logger = logger;
  }

  setLogData(log_data) {
    this.log_data = log_data;
  }

  async info(message) {
    this.logger.log("info", message);
  }

  async info(message, obj) {
    this.logger.log("info", message, {
      obj
    });
  }

  async debug(message) {
    this.logger.log("debug", message);
  }

  async debug(message, obj) {
    this.logger.log("debug", message, {
      obj
    });
  }

  // async error(message) {
  //   this.logger.log("error", message);
  // }

  // async error(message, obj) {
  //   this.logger.log("error", message, {
  //     obj
  //   });
  // }

  async warn(message) {
    this.logger.log("warn", message);
  }

  async warn(message, obj) {
    this.logger.log("warn", message, {
      obj
    });
  }

  async error(error, additionalData) {
    let message = error;
    // Error-like
    if (error && error.message && error.stack) {
      message = [error.message, "---", JSON.stringify(error.stack)].join("\n");
    }

    if (typeof message !== "string") {
      message = JSON.stringify(error);
    }

    if (additionalData) {
      message = [message, "---", JSON.stringify(additionalData)].join("\n");
    }
    return this.logger.error(["###", message, "###"].join("\n"));
  }
}

module.exports = LoggerService;
