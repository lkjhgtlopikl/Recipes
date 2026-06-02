import { pool } from "../db";
import { publicProcedure } from "../trpc";

export const getTypes = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT * FROM typeCooking; 
  `);
  return rows as { typeCooking_id: number; name: string }[];
});
