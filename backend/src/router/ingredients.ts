import z from "zod";
import { publicProcedure } from "../trpc";
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
        `
    SELECT
      i.id                AS id,
      i.idrecipe          AS recipe,
      i.ingredients_id    AS ingredient_id,
      ing.name              AS name,
      ing.calories              AS calories,
      ing.protein              AS protein,
      ing.fat              AS fat,
      ing.carbohydrates              AS carbohydrates,
      i.quantity       AS quantity,
      i.units           AS units
    FROM ingredients_recipes i
    LEFT JOIN ingredients ing    ON i.ingredients_id = ing.ingredients_id
    WHERE idrecipe = ?
  `,
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
