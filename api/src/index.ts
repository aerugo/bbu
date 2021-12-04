import path from "path";
import express, { Express } from "express";
import http, { Server } from "http";
import { config } from "./config";
import { errorFilter } from "./error";
import { register as graphql } from "./graphql";
import { getLogger } from "./logger";

// logger
const log = getLogger("Server");

// Create expressjs app
const app: Express = express();

// Create ping route
const router = express.Router();
router.get("/ping", function (req, res) {
  res.send("pong");
});
app.use(router);

// Register error filter
app.use(errorFilter);

// Register Graphql server
graphql(app);

// Create a server
const server: Server = http.createServer(app);

// Start the server
server.listen({ port: config.port }, () => {
  log.info(`Server ready at http://localhost:${config.port}`);
});
