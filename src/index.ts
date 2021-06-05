import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/Post";
import { UserResolver } from "./resolvers/User";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "1234",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

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
    context: ({ req, res }) => ({ req, res, redisClient }),
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
