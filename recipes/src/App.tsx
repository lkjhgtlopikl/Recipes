import { trpc, trpcClient } from "./lib/trpc";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Main } from "./pages/Main";
import { ListOfRecipes } from "./pages/ListOfRecipes";
import { Recipe } from "./components/Recipe";
import { User } from "./components/User";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { AddRecipe } from "./pages/AddRecipe";
import { ListOfUsers } from "./pages/ListOfUsers";
import { CookBook } from "./pages/CookBook";
import { SearchRecipe } from "./pages/SearchRecipe";
import { AddMenuToUser } from "./pages/AddMenuToUser";
import { AuthProvider } from "./context/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditRecipe } from "./pages/EditRecipe.tsx";
import { Menu } from "./pages/Menu";
const queryClient = new QueryClient();
export const App = () => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Main />}>
                Главная
              </Route>
              <Route path="/menu" element={<Menu />}>
                Главная
              </Route>
              <Route path="/recipes" element={<ListOfRecipes />}>
                Рецепты
              </Route>
              <Route
                path="/users/:userId/cookbook/:bookId"
                element={<CookBook />}
              >
                Рецепты
              </Route>
              <Route path="/recipes/add" element={<AddRecipe />}>
                добавить рецепт
              </Route>
              <Route path="/recipes/search" element={<SearchRecipe />}>
                найти рецепт
              </Route>
              <Route path="/recipes/:r" element={<Recipe />}>
                Рецепт
              </Route>
              <Route path="/recipes/edit/:r" element={<EditRecipe />}>
                Изменить рецепт
              </Route>
              <Route path="/users" element={<ListOfUsers />}>
                Пользователи
              </Route>
              <Route path="/users/:userId/menu" element={<AddMenuToUser />} />
              <Route path="/users/:userId" element={<User />} />
              <Route path="/users/login" element={<Login />}>
                Войти
              </Route>
              <Route path="/users/register" element={<Register />}>
                регистрация
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
