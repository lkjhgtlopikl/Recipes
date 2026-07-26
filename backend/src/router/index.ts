import { trpc } from "../trpc";
import { authRouter } from "./auth";
import { getCategory } from "./category";
import { addComment, delComment, getComments } from "./comments";
import {
  addCookBook,
  addRecipeToCookBook,
  delCookBook,
  delRecipeToCookBook,
  getCookBook,
  getCookBooks,
} from "./cookBook";
import { getCuisines } from "./cuisines";
import {
  getAllIngredients,
  getIngredients,
  getJaccardAll,
  getJaccardUnion,
  getRecomendetIngredients,
  getUnits,
} from "./ingredients";
import { getMenu, getMenuOfUser, addMenuToUser, getMenuToUser } from "./menu";
import { addRating, delRating, getRatings } from "./rating";
import {
  addRecipe,
  delRecipe,
  getPopularRecipes,
  getRecepie,
  getRecepies,
  getRecipesByMenu,
  getRecomendetByMeta,
  getRecomendetMeta,
  getSearchedRecepies,
  getSomeRecepies,
  getURecepies,
  updateRecipe,
} from "./recipes";
import { getSteps } from "./steps";
import { getTypes } from "./types";
import { delUser, getSearchedUsers, getUser, getUsers } from "./user";

export const trpcRouter = trpc.router({
  //Получение из бд
  getRecepie: getRecepie,
  getRecepies: getRecepies,
  getSearchedRecepies: getSearchedRecepies,
  getSteps: getSteps,
  getUserRecepies: getURecepies,
  getUser: getUser,
  getUsers: getUsers,
  getSearchedUsers: getSearchedUsers,
  getCuisines: getCuisines,
  getTypes: getTypes,
  getIngredients: getIngredients,
  getCookBooks: getCookBooks,
  getCookBook: getCookBook,
  getAllIngredients: getAllIngredients,
  getCategory: getCategory,
  getUnits: getUnits,
  auth: authRouter,
  getMenu: getMenu,
  getMenuOfUser: getMenuOfUser,
  getComments: getComments,
  getRatings: getRatings,
  getMenuToUser: getMenuToUser,
  getRecomendetIngredients: getRecomendetIngredients,
  getRecomendetMeta: getRecomendetMeta,
  getSomeRecepies: getSomeRecepies,
  getRecomendetByMeta: getRecomendetByMeta,
  getRecipesByMenu: getRecipesByMenu,
  getJaccardAll: getJaccardAll,
  getJaccardUnion: getJaccardUnion,
  getPopularRecipes: getPopularRecipes,
  //добавоение в бд
  addRecipe: addRecipe,
  addCookBook: addCookBook,
  addComment: addComment,
  addRating: addRating,
  addRecipeToCookBook: addRecipeToCookBook,
  addMenuToUser: addMenuToUser,
  //удаление из бд
  delRecipe: delRecipe,
  delUser: delUser,
  delCookBook: delCookBook,
  delComment: delComment,
  delRating: delRating,
  delRecipeToCookBook: delRecipeToCookBook,
  //обновление
  updateRecipe: updateRecipe,
});
export type TrpcRouter = typeof trpcRouter;
