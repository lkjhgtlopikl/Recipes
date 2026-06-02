import { z } from "zod";
import bcrypt from "bcryptjs";
import { publicProcedure, protectedProcedure } from "../trpc";
import { pool } from "../db";
import { signToken } from "../lib/jwt";
import { TRPCError } from "@trpc/server";

export const authRouter = {
  // Регистрация
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(16),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input }) => {
      // Проверка уникальности email/username
      const [existing] = await pool.query(
        "SELECT userId FROM users WHERE email = ? OR username = ?",
        [input.email, input.username],
      );
      if ((existing as any[]).length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Пользователь с таким email или username уже существует",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const [result] = await pool.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [input.username, input.email, hashedPassword],
      );
      const userId = (result as any).insertId;
      const token = signToken({ userId });

      return {
        token,
        user: {
          id: userId,
          username: input.username,
          email: input.email,
        },
      };
    }),

  // Вход
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input }) => {
      const [rows] = await pool.query(
        "SELECT userId, username, email, password FROM users WHERE email = ?",
        [input.email],
      );
      const user = (rows as any[])[0];
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Неверный email или пароль",
        });
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Неверный email или пароль",
        });
      }

      const token = signToken({ userId: user.userId });
      return {
        token,
        user: {
          id: user.userId,
          username: user.username,
          email: user.email,
        },
      };
    }),

  // Получить текущего пользователя по токену
  me: protectedProcedure.query(async ({ ctx }) => {
    const [rows] = await pool.query(
      "SELECT userId, username, email FROM users WHERE userId = ?",
      [ctx.userId],
    );
    const user = (rows as any[])[0];
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Пользователь не найден",
      });
    }
    return {
      id: user.userId,
      username: user.username,
      email: user.email,
    };
  }),
};
