import * as httpStatusCodes from "http-status-codes";
import * as express from "express";
import { getLogger } from "./logger";
import { config } from "./config";

// Logger
const log = getLogger("ErrorHandler");

// Generic interface for errors
interface Error {
  status?: number;
  fields?: string[];
  message: string;
  name: string;
  stack?: string;
}

/**
 * Express middleware inspect the error and construct
 * a custom error http response.
 */
function errorFilter(err: Error, _req: express.Request, res: express.Response, next: express.NextFunction): void {
  const body = {
    name: err.name,
    message: err.message || "An error occurred",
    fields: err.fields || undefined,
    stack: config.error_with_stack ? err.stack : undefined,
    code: httpStatusCodes.INTERNAL_SERVER_ERROR,
  };
  log.error(`Url ${_req.originalUrl} produced http error`, body);
  res.status(body.code).json(body);
  next();
}

export { errorFilter };
