import { pool } from "../db";
import { publicProcedure } from "../trpc";

export const getCategory = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT * FROM category; 
  `);
  return rows as { category_id: number; name: string }[];
});
