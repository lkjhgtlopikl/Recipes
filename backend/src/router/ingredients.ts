import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { pool } from "../db";
import { TRPCError } from "@trpc/server";

export const getAllIngredients = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT * FROM ingredients i;
  `);
  return rows;
  //  return rows as { ingredients_id: number; name: string; calories:number; protein:number;fat:number;carbohydrates:number}[];
});
export const getUnits = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT DISTINCT units FROM ingredients_recipes
  `);
  const units = (rows as { units: string }[]).map((r) => r.units);
  return units;
});

export const getIngredients = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM full_ingredient WHERE recipe = ?`,
        input.id,
      );
      if (!rows) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ингредиенты не найден",
        });
      }
      return rows;
    } catch (error) {
      console.error("Ошибка при получении ингредиентов:", error);
      throw error;
    }
  });

export const getRecomendetIngredients = protectedProcedure.query(
  async ({ ctx }) => {
    const userId = ctx.userId;
    const [Ingredients] = await pool.query(
      `SELECT DISTINCT i.ingredients_id AS ingredients
  FROM ingredients_recipes i
  WHERE i.idrecipe IN (
    SELECT r.idrecipe
    FROM ratings r
    WHERE r.userId = ? AND r.mark >= 4
  UNION
   SELECT cb.idrecipe
    FROM cook_book c
    LEFT JOIN cook_book_recipes cb    ON c.id = cb.cook_book_id
    WHERE c.userId = ?)`,
      [userId, userId],
    );
    return Ingredients;
  },
);
export const getJaccardAll = protectedProcedure
  .input(z.object({ ids: z.array(z.number()) }))
  .query(async ({ input }) => {
    let JC = [];
    for (const i of input.ids) {
      const [All] = await pool.query(
        `SELECT COUNT(i.ingredients_id) AS ingredients
  FROM ingredients_recipes i
  WHERE i.idrecipe = ?`,
        [i],
      );
      JC.push(All);
    }
    return JC;
  });
export const getJaccardUnion = protectedProcedure
  .input(z.object({ ids: z.array(z.number()), ing: z.array(z.number()) }))
  .query(async ({ input }) => {
    let JC = [];
    for (const i of input.ids) {
      const [Union] = await pool.query(
        `SELECT COUNT(i.ingredients_id) AS ingredients
  FROM ingredients_recipes i
  WHERE i.idrecipe = ? AND ingredients_id IN (?)`,
        [i, input.ing],
      );
      JC.push(Union);
    }
    return JC;
  });
