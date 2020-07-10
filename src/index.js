import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import compression from "compression";
// import get from "lodash.get";

import { RedisCache } from "apollo-server-cache-redis";
import Redis, { RedisConfigOption } from "./external-libs/redis";

import schema from "./graphql";
import generateDS from "./datasources";
import { permissions } from "./permissions";

import { connect as connectES } from "./external-libs/es-local";
import { connect as connectMongoDB } from "./external-libs/mongoose";
import Logger from "./external-libs/winston";

require("dotenv").config();

const port = parseInt(process.env.PORT, 10) || 9008;
const playground = (process.env.APOLLO_PLAYGROUND === "true" && true) || false;
const introspection =
  (process.env.APOLLO_INTROSPECTION === "true" && true) || false;
const debug = (process.env.APOLLO_DEBUG === "true" && true) || false;
const tracing = (process.env.APOLLO_TRACING === "true" && true) || false;
const path = process.env.APOLLO_PATH || "/graphql";

const whitelist = process.env.SERVER_REQUEST_WHITE_LIST;
const corsEnabled = process.env.SERVER_CORS_ENABLED;

async function init() {
  const app = express();

  const Client = await connectES();

  const logger = new Logger("gateway", false);

  // parse application/json
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  let corsOptions = {
    origin: function(origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed access!"));
      }
    }
  };

  const loggingMiddleware = (req, res, next) => {
    if (
      req.body.operationName &&
      !["IntrospectionQuery"].includes(req.body.operationName)
    ) {
      const getIP =
        (
          req.headers["X-Forwarded-For"] ||
          req.headers["x-forwarded-for"] ||
          ""
        ).split(",")[0] || req.client.remoteAddress;
      const ip = (getIP.length < 15 && getIP) || getIP.slice(7) || req.ip;
      const { query, ...body } = req.body;
      logger.info(`[GraphQL.request] ${ip}`, body);
    }
    next();
  };
  if (corsEnabled !== "true") {
    corsOptions = {};
  }
  app.use(compression());
  app.use(cors(corsOptions));
  app.use(loggingMiddleware);

  // TODO Enable CORS
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Access-Control-Request-Method"
    );
    next();
  });

  // error handler
  app.use((err, req, res, next) => {
    // render the error page
    // logger.error(err.message);
    res.status(err.status || 500);
    res.json({ message: "Not allowed access!" });
  });

  // Append apollo to our API
  const server = new ApolloServer({
    schema,
    dataSources: () => ({
      ...generateDS
    }),
    cache: new RedisCache(RedisConfigOption),
    context: {
      Client,
      Redis
    },
    middlewares: [permissions],
    validationRules: [depthLimit(7)],
    tracing,
    introspection,
    playground,
    debug,
    formatError: error => {
      // filter whatever errors your don't want to log
      logger.error(`[GraphQL.error]`, error);
      return {
        message: error.message,
        errorCode: (error.extensions && error.extensions.code) || null
      };
    }
  });
  server.applyMiddleware({ app, path, cors: false });

  connectMongoDB()
    .then(() => {
      logger.info("Mongo connect successful!");
      // The `listen` method launches a web server.
      app.listen(port, () => {
        logger.info(
          `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
        );
        logger.info(
          `Try your health check at: http://localhost:${port}${server.graphqlPath}/.well-known/apollo/server-health`
        );
      });
    })
    .catch(error => {
      logger.error(error);
      process.exit(1);
    });
}

init();
