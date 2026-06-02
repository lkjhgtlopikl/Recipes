import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { pool } from "../db";
import { TRPCError } from "@trpc/server";

//получение кулинраных книг пользователя по id пользователя
export const getRatings = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [rows] = await pool.query(
        `
    SELECT
      AVG(r.mark)      AS mark,
      COUNT(r.mark)     AS count,
      JSON_ARRAYAGG(r.userId)       AS users
    FROM ratings r
    WHERE r.idrecipe = ?
    GROUP BY r.idrecipe
  `,
        input.id,
      );
      if (!rows) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Оценки не найден",
        });
      }
      return rows;
    } catch (error) {
      console.error("Ошибка при получении оценок:", error);
      throw error;
    }
  });

//Добавление оценки
export const addRating = protectedProcedure
  .input(z.object({ mark: z.number(), idrecipe: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    // 1. Вставка в таблицу ratings
    const [result] = await pool.query(
      `INSERT INTO ratings ( mark, idrecipe, userId) VALUES (?, ?, ?)`,
      [input.mark, input.idrecipe, userId],
    );
    const ratingkId = (result as any).insertId;
    return { success: true, ratingkId };
  });

//удаление оценки
export const delRating = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    //удаление из связывающей таблицы
    await pool.query(`DELETE FROM ratings WHERE userId = ?`, [input.id]);
    return { success: true };
  });
