import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up(); // to auto run migrations
  const app = express();
  const RedisStore = connectRedis(session); //redis
  const redisClient = new Redis(); //redis client

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax", // csrf
      },
      saveUninitialized: false,
      secret: "keyhere",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver], // add Resolvers here.
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res, redisClient }),
  });
  apolloServer.applyMiddleware({
    app,
    cors: false,
  }); // creates graphQL playground

  app.listen(4000, () => {
    console.log("Server is running on Port 4000");
  });
};

main().catch((e) => console.error(e));
