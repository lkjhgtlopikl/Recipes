import { protectedProcedure, publicProcedure } from "../trpc";
import { pool } from "../db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const getMenu = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT * FROM menu; 
  `);
  return rows as { menu_id: number; name: string }[];
});
export const getMenuOfUser = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    const [rows] = await pool.query(
      `
    SELECT menu_id FROM users_menu WHERE userId = ?; 
  `,
      [input.id],
    );
    return rows;
  });

export const addMenuToUser = protectedProcedure
  .input(z.object({ id: z.array(z.number()) }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    await pool.query(`DELETE FROM users_menu WHERE userId = ?;`, [userId]);
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
