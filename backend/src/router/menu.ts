import { publicProcedure } from "../trpc";
import { pool } from "../db";

export const getMenu = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT * FROM menu; 
  `);
  return rows as { menu_id: number; name: string }[];
});
