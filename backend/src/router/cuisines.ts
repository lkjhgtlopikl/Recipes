import { publicProcedure } from "../trpc";
import { pool } from "../db";

export const getCuisines = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT * FROM cuisine; 
  `);
  return rows as { cuisine_id: number; name: string }[];
});
