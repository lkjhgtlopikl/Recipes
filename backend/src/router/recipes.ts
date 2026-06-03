import { publicProcedure, protectedProcedure, trpc } from "../trpc";
import { z } from "zod";
import { pool } from "../db";
import { TRPCError } from "@trpc/server";
import { addRecipeInput, editRecipeInput, searchRecipeInput } from "./input";

//Получить все рецепты на платформе
export const getRecepies = publicProcedure.query(async () => {
  const [rows] = await pool.query(`
    SELECT
      r.idrecipe           AS id,
      r.img_url            AS image,
      r.title              AS title,
      r.userId              AS userId,
      u.username           AS author,
      cu.name              AS cuisine,
      tc.name              AS typeCooking,
      cat.name             AS category,
      r.cookingTime        AS cookingTime,
      r.servings           AS servings,
      r.difficulty         AS difficulty,
      r.description        AS description
    FROM recipes r
    LEFT JOIN users u    ON r.userId = u.userId
    LEFT JOIN cuisine cu ON r.cuisine_id = cu.cuisine_id
    LEFT JOIN typeCooking tc ON r.typeCooking_id = tc.typeCooking_id
    LEFT JOIN category cat ON r.category_id = cat.category_id
  `);
  return rows;
});
//Получить рецепты согласно запросу из поиска
export const getSearchedRecepies = publicProcedure
  .input(searchRecipeInput)
  .query(async ({ input }) => {
    const {
      title,
      cuisine_id,
      typeCooking_id,
      category_id,
      cookingTime,
      difficulty,
      menu_id,
      include,
      exclude,
    } = input;

    // Базовый запрос
    let query = `SELECT r.* FROM recipes r WHERE 1=1`;
    const params: any[] = [];

    if (category_id) {
      query += ` AND r.category_id = ?`;
      params.push(category_id);
    }
    if (cookingTime) {
      query += ` AND r.cookingTime = ?`;
      params.push(cookingTime);
    }
    if (cuisine_id) {
      query += ` AND r.cuisine_id = ?`;
      params.push(cuisine_id);
    }
    if (difficulty) {
      query += ` AND r.difficulty = ?`;
      params.push(difficulty);
    }
    if (title) {
      query += ` AND r.title LIKE ?`;
      params.push(`%${title}%`);
    }
    if (typeCooking_id) {
      query += ` AND r.typeCooking_id = ?`;
      params.push(typeCooking_id);
    }
    if (menu_id) {
      query += ` AND r.menu_id = ?`;
      params.push(menu_id);
    }

    // Ингредиенты включаемые
    if (include.length > 0) {
      for (const ingId of include) {
        query += ` AND EXISTS (SELECT 1 FROM ingredients_recipes ir WHERE ir.idrecipe = r.idrecipe AND ir.ingredients_id = ?)`;
        params.push(ingId);
      }
    }

    // Ингредиенты исключаемые
    if (exclude.length > 0) {
      query += ` AND NOT EXISTS (SELECT 1 FROM ingredients_recipes ir WHERE ir.idrecipe = r.idrecipe AND ir.ingredients_id IN (${exclude.map(() => "?").join(",")}))`;
      params.push(...exclude);
    }

    const [rows] = await pool.query(query, params);
    console.log(rows);
    return rows;
  });

//получить рецепт по id
export const getRecepie = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [row] = await pool.query(
        `
    SELECT
      r.idrecipe           AS id,
      r.img_url            AS image,
      r.title              AS title,
      r.userId             AS userId,
      u.username           AS author,
      cu.name              AS cuisine,
      tc.name              AS typeCooking,
      cat.name             AS category,
      r.cookingTime        AS cookingTime,
      r.servings           AS servings,
      r.difficulty         AS difficulty,
      r.description        AS description
    FROM recipes r
    LEFT JOIN users u    ON r.userId = u.userId
    LEFT JOIN cuisine cu ON r.cuisine_id = cu.cuisine_id
    LEFT JOIN typeCooking tc ON r.typeCooking_id = tc.typeCooking_id
    LEFT JOIN category cat ON r.category_id = cat.category_id
    WHERE idrecipe = ?
  `,
        input.id,
      );
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Рецепт не найден" });
      }
      return row;
    } catch (error) {
      console.error("Ошибка при получении рецепта:", error);
      throw error;
    }
  });

//Получение рецептов, созданных пользователем с указанным id
export const getURecepies = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    try {
      const [row] = await pool.query(
        `
    SELECT
      r.idrecipe           AS id,
      r.img_url            AS image,
      r.title              AS title,
      u.username           AS author,
      cu.name              AS cuisine,
      tc.name              AS typeCooking,
      cat.name             AS category,
      r.cookingTime        AS cookingTime,
      r.servings           AS servings,
      r.difficulty         AS difficulty,
      r.description        AS description
    FROM recipes r
    LEFT JOIN users u    ON r.userId = u.userId
    LEFT JOIN cuisine cu ON r.cuisine_id = cu.cuisine_id
    LEFT JOIN typeCooking tc ON r.typeCooking_id = tc.typeCooking_id
    LEFT JOIN category cat ON r.category_id = cat.category_id
    WHERE u.userId = ?
  `,
        input.id,
      );
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Рецепты не найден",
        });
      }
      return row;
    } catch (error) {
      console.error("Ошибка при получении рецептов:", error);
      throw error;
    }
  });

//Добавление рецепта
export const addRecipe = protectedProcedure
  .input(addRecipeInput)
  .mutation(async ({ ctx, input }) => {

    const userId = ctx.userId;
    // 1. Вставка в таблицу recipes
    const [result] = await pool.query(
      `INSERT INTO recipes ( title, cookingTime, servings, difficulty, description, userId, category_id, cuisine_id, menu_id, typeCooking_id, calories, fat, carbohydrates, img_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.cookingTime,
        input.servings,
        input.difficulty,
        input.description,
        userId,
        input.category_id,
        input.cuisine_id,
        input.menu_id,
        input.typeCooking_id,
        input.calories ?? null,
        input.fat ?? null,
        input.carbohydrates ?? null,
        input.img_url ?? 'https://res.cloudinary.com/dayoqjmmv/image/upload/v1780179872/samples/food/fish-vegetables.jpg',
      ],
    );
    const recipeId = (result as any).insertId;
    // 2. Вставка ингредиентов
    for (const ing of input.ingredients) {
      await pool.query(
        `INSERT INTO ingredients_recipes ( idrecipe, ingredients_id, quantity, units) VALUES (?, ?, ?, ?)`,
        [recipeId, ing.ingredient_id, ing.quantity, ing.unit],
      );
    }
    // 3. Вставка шагов
    for (let index = 0; index < input.steps.length; index++) {
      await pool.query(
        `INSERT INTO steps ( text, idrecipe, step_number, img_url) VALUES (?, ?, ?, ?)`,
        [
          input.steps[index].description,
          recipeId,
          index + 1,
          input.steps[index].image ?? null,
        ],
      );
    }

    return { success: true, recipeId };
  });

//удаление рецептов
export const delRecipe = protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    // 1. удаление из таблицы ингредиентов
    await pool.query(`DELETE FROM ingredients_recipes WHERE idrecipe = ?`, [
      input.id,
    ]);
    // 2. удаление из таблицы шагов
    await pool.query(`DELETE FROM steps WHERE idrecipe = ?`, [input.id]);
    // 3. удаление из таблицы оценок
    await pool.query(`DELETE FROM ratings WHERE idrecipe = ?`, [input.id]);
    // 4. удаление из таблицы комментариев
    await pool.query(`DELETE FROM comments WHERE idrecipe = ?`, [input.id]);
    // 5. удаление из таблицы кулинарных книг
    await pool.query(`DELETE FROM cook_book_recipes WHERE idrecipe = ?`, [
      input.id,
    ]);
    // 6. удаление из таблицы recipes
    await pool.query(`DELETE FROM recipes WHERE idrecipe = ?`, [input.id]);
    return { success: true };
  });

  //изменение рецепта
export const updateRecipe = publicProcedure
  .input(editRecipeInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    // 1. Вставка в таблицу recipes
    const [result] = await pool.query(
      `UPDATE recipes SET 
      title = ?, 
       cookingTime = ?, 
       servings = ?, 
       difficulty = ?, 
       description = ?, 
       userId = ?, 
       category_id = ?, 
       cuisine_id = ?, 
       menu_id = ?, 
       typeCooking_id = ?, 
       calories = ?, 
       fat = ?, 
       carbohydrates = ?, 
       img_url = ?
       WHERE idrecipe = ?
       `,
      [
        input.title,
        input.cookingTime,
        input.servings,
        input.difficulty,
        input.description,
        userId,
        input.category_id,
        input.cuisine_id,
        input.menu_id,
        input.typeCooking_id,
        input.calories ?? null,
        input.fat ?? null,
        input.carbohydrates ?? null,
        input.img_url ?? null,
        input.idrecipe
      ],
    );
    const recipeId = (result as any).insertId;

    // 2. Вставка ингредиентов
    for (const ing of input.ingredients) {
      await pool.query(
        `UPDATE ingredients_recipes SET   ingredients_id = ?, quantity = ?, units = ? WHERE id = ? AND idrecipe = ?`,
        [ing.ingredient_id, ing.quantity, ing.unit,ing.id, input.idrecipe],
      );
    }
    // 3. Вставка шагов
    for (let index = 0; index < input.steps.length; index++) {
      await pool.query(
        `UPDATE steps SET text = ?, step_number = ?, img_url = ? WHERE id = ? AND idrecipe = ?`,
        [
          input.steps[index].description,
          index + 1,
          input.steps[index].image ?? null,
          input.steps[index].id,
          input.idrecipe
        ],
      );
    }

    return { success: true, recipeId };
  });
  