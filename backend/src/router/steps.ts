import z from "zod";
import { publicProcedure } from "../trpc";
import { pool } from "../db";
import { TRPCError } from "@trpc/server";

export const getSteps = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [row] = await pool.query(
        `
    SELECT
      s.id                AS id,
      s.text              AS text,
      s.idrecipe          AS idRecipe,
      s.step_number       AS number,
      s.img_url           AS image
    FROM steps s
    WHERE idrecipe = ?
  `,
        input.id,
      );
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Этапы не найден" });
      }
      return row;
    } catch (error) {
      console.error("Ошибка при получении этапов:", error);
      throw error;
    }
  });
