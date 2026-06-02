import { initTRPC, TRPCError } from "@trpc/server";
import { verifyToken } from "./lib/jwt";
import type { Request, Response } from "express";

// Тип контекста: будем хранить userId, если токен передан
export interface Context {
  userId: number | null;
  req: Request;
  res: Response;
}

export const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

// Middleware для проверки авторизации
export const protectedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
