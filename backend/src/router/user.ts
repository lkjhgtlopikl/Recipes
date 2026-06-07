import { protectedProcedure, publicProcedure, trpc } from "../trpc";
import { z } from "zod";
import { pool } from "../db";
import { TRPCError } from "@trpc/server";

//получить всех пользователей
export const getUsers = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT
      u.userId           AS id,
      u.username         AS name,
      u.email            AS email,
      u.password         AS password,
      u.create_time      AS create_time
    FROM users u;
  `);
  return rows;
});

//получить пользователя по id
export const getUser = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [row] = await pool.query(
        `
    SELECT
      u.userId           AS id,
      u.username         AS name,
      u.email            AS email,
      u.password         AS password,
      u.create_time      AS create_time
    FROM users u
    WHERE u.userId = ?
  `,
        input.id,
      );
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }
      return row;
    } catch (error) {
      console.error("Ошибка при получении пользователя:", error);
      throw error;
    }
  });

//получить пользователя по username
export const getSearchedUsers = publicProcedure
  .input(z.object({ username: z.string() }))
  .query(async ({ input }) => {
    try {
      const searchPattern = `%${input.username}%`;
      const [row] = await pool.query(
        `
    SELECT
      u.userId           AS id,
      u.username         AS name,
      u.email            AS email,
      u.password         AS password,
      u.create_time      AS create_time
    FROM users u
    WHERE u.username LIKE ?
  `,
        searchPattern,
      );
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }
      return row;
    } catch (error) {
      console.error("Ошибка при получении пользователя:", error);
      throw error;
    }
  });

//удаление пользователя
export const delUser = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    // 1. удаление из таблицы recipes
    await pool.query(`DELETE FROM recipes WHERE userId = ?`, [input.id]);
    // 2. удаление из таблицы оценок
    await pool.query(`DELETE FROM ratings WHERE userId = ?`, [input.id]);
    // 3. удаление из таблицы комментариев
    await pool.query(`DELETE FROM comments WHERE userId = ?`, [input.id]);
    // 4. удаление из таблицы кулинарных книг
    await pool.query(`DELETE FROM cook_book WHERE userId = ?`, [input.id]);
    // 5. удаление из таблицы users
    await pool.query(`DELETE FROM users WHERE userId = ?`, [input.id]);
    return { success: true };
  });

export const addMenuToUser = protectedProcedure
  .input(z.object({ id: z.array(z.number()) }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    for (const i of input.id) {
      await pool.query(
        `INSERT INTO users_menu ( userId, menu_id) VALUES (?, ?)`,
        [userId, i],
      );
    }
    return { success: true };
  });

export const getMenuToUser = publicProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    try {
      const [rows] = await pool.query(
        `
    SELECT
      JSON_ARRAYAGG(m.name)       AS menu
    FROM users_menu u
    LEFT JOIN menu m    ON m.menu_id = u.menu_id
    WHERE u.userId = ?
    GROUP BY u.userId
  `,
        [input.userId],
      );
      if (rows == null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "столы не найден",
        });
      }
      return rows;
    } catch (error) {
      console.error("Ошибка при получении столов:", error);
      throw error;
    }
  });
