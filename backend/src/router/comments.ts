import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { pool } from "../db";
import { TRPCError } from "@trpc/server";
//Получение комментариев по id рецепта
export const getComments = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [rows] = await pool.query(
        `
    SELECT
      c.id          AS id,
      c.userId      AS userId,
      c.text       AS text,
      u.username       AS user,
      c.idrecipe       AS recipe
    FROM comments c
    LEFT JOIN  users u   ON c.userId = u.userId
    WHERE idrecipe = ?
  `,
        input.id,
      );
      if (!rows) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Комментарии не найден",
        });
      }
      return rows;
    } catch (error) {
      console.error("Ошибка при получении комментариев:", error);
      throw error;
    }
  });

//Добавление кулинарной книги
export const addComment = protectedProcedure
  .input(z.object({ text: z.string(), idrecipe: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    // 1. Вставка в таблицу comments
    const [result] = await pool.query(
      `INSERT INTO comments ( text, idrecipe, userId) VALUES (?, ?, ?)`,
      [input.text, input.idrecipe, userId],
    );
    const id = (result as any).insertId;
    return { success: true, id };
  });

//удаление кулинарной книги
export const delComment = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    // 1. удаление из таблицы comments
    await pool.query(`DELETE FROM comments WHERE id = ?`, [input.id]);
    return { success: true };
  });
