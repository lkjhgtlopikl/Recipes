import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";
import { pool } from "../db";
import { TRPCError } from "@trpc/server";

//получение кулинраных книг пользователя по id пользователя
export const getCookBooks = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [rows] = await pool.query(
        `
    SELECT
      c.id AS id,
      c.title AS title,
      JSON_ARRAYAGG(cb.idrecipe)       AS recipe
    FROM cook_book c
   LEFT JOIN  cook_book_recipes cb   ON cb.cook_book_id = c.id
    WHERE c.userId = ?
    GROUP BY c.id
  `,
        input.id,
      );
      if (!rows) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Кулинарные книги не найден",
        });
      }
      return rows;
    } catch (error) {
      console.error("Ошибка при получении кулинарных книг:", error);
      throw error;
    }
  });
//получение кулинраной книги по id
export const getCookBook = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [rows] = await pool.query(
        `
    SELECT
  cb.id              AS cook_book_id,
  cb.userId         AS userId,
  cb.title          AS title,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'id',           r.idrecipe,
      'image',        r.img_url,
      'title',        r.title,
      'author',       u.username,
      'cuisine',      cu.name,
      'typeCooking',  tc.name,
      'category',     cat.name,
      'cookingTime',  r.cookingTime,
      'servings',     r.servings,
      'difficulty',   r.difficulty,
      'description',  r.description
    )
  ) AS recipes
FROM cook_book cb
LEFT JOIN cook_book_recipes cbr ON cb.id = cbr.cook_book_id
LEFT JOIN recipes r            ON r.idrecipe = cbr.idrecipe
LEFT JOIN users u             ON r.userId = u.userId
LEFT JOIN cuisine cu          ON r.cuisine_id = cu.cuisine_id
LEFT JOIN typeCooking tc      ON r.typeCooking_id = tc.typeCooking_id
LEFT JOIN category cat        ON r.category_id = cat.category_id
WHERE cb.id = ?               
GROUP BY cb.id, cb.title;
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

//Добавление кулинарной книги
export const addCookBook = protectedProcedure
  .input(z.object({ title: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    //Вставка в таблицу cook_book
    const [result] = await pool.query(
      `INSERT INTO cook_book ( title, userId) VALUES (?, ?)`,
      [input.title, userId],
    );
    const cookBookId = (result as any).insertId;
    return { success: true, cookBookId };
  });

//удаление кулинарной книги
export const delCookBook = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    //удаление из связывающей таблицы
    await pool.query(`DELETE FROM cook_book_recipes WHERE cook_book_id = ?`, [
      input.id,
    ]);
    //удаление из таблицы кулинарных книг
    await pool.query(`DELETE FROM cook_book WHERE id = ?`, [input.id]);
    return { success: true };
  });

//Добавление рецепта в кулинарную книгу
export const addRecipeToCookBook = protectedProcedure
  .input(z.object({ cook_book_id: z.number(), idrecipe: z.number() }))
  .mutation(async ({ input }) => {
    const [result] = await pool.query(
      `INSERT INTO cook_book_recipes ( cook_book_id, idrecipe) VALUES (?, ?)`,
      [input.cook_book_id, input.idrecipe],
    );
    const cookBookId = (result as any).insertId;
    return { success: true, cookBookId };
  });

//удаление рецепта из  кулинарной книги
export const delRecipeToCookBook = protectedProcedure
  .input(z.object({ cook_book_id: z.number(), idrecipe: z.number() }))
  .mutation(async ({ input }) => {
    await pool.query(
      `DELETE FROM cook_book_recipes WHERE cook_book_id = ? AND idrecipe = ? `,
      [input.cook_book_id, input.idrecipe],
    );
    return { success: true };
  });
