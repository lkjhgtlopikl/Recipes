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
import { getAllIngredients, getIngredients, getUnits } from "./ingredients";
import { getMenu } from "./menu";
import { addRating, delRating, getRatings } from "./rating";
import {
  addRecipe,
  delRecipe,
  getRecepie,
  getRecepies,
  getSearchedRecepies,
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
  getComments: getComments,
  getRatings: getRatings,
  //добавоение в бд
  addRecipe: addRecipe,
  addCookBook: addCookBook,
  addComment: addComment,
  addRating: addRating,
  addRecipeToCookBook: addRecipeToCookBook,
  //удаление из бд
  delRecipe: delRecipe,
  delUser: delUser,
  delCookBook: delCookBook,
  delComment: delComment,
  delRating: delRating,
  delRecipeToCookBook: delRecipeToCookBook,
  //обновление 
  updateRecipe:updateRecipe,
});
export type TrpcRouter = typeof trpcRouter;
