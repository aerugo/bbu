import { Express } from "express";
import { ApolloServer } from "apollo-server-express";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { config } from "../config";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { loadData } from "../data/loader";
import { getLogger } from "../logger";

// logger
const log = getLogger("GraphQl");

export async function register(app: Express): Promise<void> {
  // Load data from JSON file into memory
  log.info("Loading data from JSON file...");
  await loadData();
  log.info("Data loaded successfully");

  // Create executable schema with custom resolvers
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // create the graphql server with apollo
  const serverGraphql = new ApolloServer({
    schema,
    plugins: [responseCachePlugin()],
    cacheControl: {
      defaultMaxAge: config.graphql_cache_max_age,
    },
  });

  // Register the graphql server to express
  serverGraphql.applyMiddleware({ app });
}
