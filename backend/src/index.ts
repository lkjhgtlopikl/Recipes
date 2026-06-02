import express from "express";
import * as trpcExp from "@trpc/server/adapters/express";
import { trpcRouter } from "./router/index";
import cors from "cors";
import { createContext } from "./lib/ctx";
try {
  const app = express();
  app.use(cors(
    {
      origin: "http://localhost:5173",
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,

    }
  ));
  app.use(
    "/trpc",
    trpcExp.createExpressMiddleware({
      router: trpcRouter,
      createContext,
    }),
  );
  app.listen(3000, () => {
    console.info("listening at http://localhost:3000");
  });
} catch (error) {
  console.error(error);
}
