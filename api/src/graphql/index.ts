import { Express } from "express";
import { ApolloServer } from "apollo-server-express";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { assertSchema, makeAugmentedSchema } from "neo4j-graphql-js";
import * as neo4j from "neo4j-driver";
import { config } from "../config";
import { resolvers, typeDefs, gqlConfig } from "./schema";
import { getLogger } from "../logger";

// logger
const log = getLogger("GraphQl");

export type ResolverContext = { driver: neo4j.Driver };

export async function register(app: Express): Promise<void> {
  // create the neo4j driver
  const driver = neo4j.driver(
    config.neo4j.url,
    neo4j.auth.basic(config.neo4j.login, config.neo4j.password),
    config.neo4j.options,
  );

  // create the Neo4j graphql schema
  const schema = makeAugmentedSchema({
    typeDefs,
    resolvers,
    config: gqlConfig,
  });

  // create the graphql server with apollo
  const serverGraphql = new ApolloServer({
    schema,
    context: {
      driver,
    },
    plugins: [responseCachePlugin()],
    cacheControl: {
      defaultMaxAge: config.graphql_cache_max_age,
    },
  });

  // Register the graphql server to express
  serverGraphql.applyMiddleware({ app });
}
