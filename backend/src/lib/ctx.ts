import { verifyToken } from "./jwt";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { inferAsyncReturnType } from "@trpc/server";

export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  let userId: number | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch {}
  }
  return { userId, req, res };
};

export type Context = inferAsyncReturnType<typeof createContext>;
