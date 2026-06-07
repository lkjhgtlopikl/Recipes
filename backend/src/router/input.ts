import { z } from "zod";

export const addUserInput = z.object({
  userId: z.string(),
  username: z.string().min(1),
  email: z.string().min(1),
  password: z
    .string()
    .min(8, "Пароль должен содержать не менее 8 символов!")
    .regex(/^[a-z0-9-]+$/),
  recepies: z.array(z.string()),
  cookBooks: z.array(
    z.object({ title: z.string(), recepies: z.array(z.string()) }),
  ),
});
export const loginUserInput = z.object({
  username: z.string().min(1),
  password: z.string().min(8, "Пароль должен содержать не менее 8 символов!"),
});
export const addRecipeInput = z.object({
  title: z.string(),
  cookingTime: z.number(),
  servings: z.number(),
  difficulty: z.enum(["1", "2", "3", "4", "5"]),
  description: z.string(),
  category_id: z.number(),
  cuisine_id: z.number(),
  menu_id: z.number(),
  typeCooking_id: z.number(),
  calories: z.number().nullable().optional(),
  fat: z.number().nullable().optional(),
  carbohydrates: z.number().nullable().optional(),
  img_url: z.string().nullable().optional(),
  ingredients: z.array(
    z.object({
      ingredient_id: z.number(),
      quantity: z.number(),
      unit: z.string(),
    }),
  ),
  steps: z.array(
    z.object({
      image: z.string().nullable().optional(),
      description: z.string(),
    }),
  ),
});
export const editRecipeInput = z.object({
  idrecipe: z.number(),
  title: z.string(),
  cookingTime: z.number(),
  servings: z.number(),
  difficulty: z.enum(["1", "2", "3", "4", "5"]),
  description: z.string(),
  category_id: z.number(),
  cuisine_id: z.number(),
  menu_id: z.number(),
  typeCooking_id: z.number(),
  calories: z.number().nullable().optional(),
  fat: z.number().nullable().optional(),
  carbohydrates: z.number().nullable().optional(),
  img_url: z.string().nullable().optional(),
  ingredients: z.array(
    z.object({
      id: z.number(),
      ingredient_id: z.number(),
      quantity: z.number(),
      unit: z.string(),
    }),
  ),
  steps: z.array(
    z.object({
      id: z.number(),
      image: z.string().nullable().optional(),
      description: z.string(),
    }),
  ),
});

export const searchRecipeInput = z.object({
  title: z.string().optional().default(""),
  cuisine_id: z.number().optional(),
  typeCooking_id: z.number().optional(),
  category_id: z.number().optional(),
  cookingTime: z.number().optional(),
  difficulty: z.string().optional(),
  menu_id: z.number().optional(),
  include: z.array(z.number()).optional().default([]),
  exclude: z.array(z.number()).optional().default([]),
});
