import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { trpc } from "../lib/trpc"; // TrpcProvider больше не импортируем
import { RecipeCard } from "../components/RecipeCard";
import { Load } from "../components/Load";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Err } from "../components/Err";
export const ListOfRecipes = (prop) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryParams = {
    title: searchParams.get("title") || undefined,
    cuisine_id: Number(searchParams.get("cuisine_id")) || undefined,
    typeCooking_id: Number(searchParams.get("typeCooking_id")) || undefined,
    category_id: Number(searchParams.get("category_id")) || undefined,
    cookingTime: Number(searchParams.get("cookingTime")) || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    menu_id: Number(searchParams.get("menu_id")) || undefined,
    include: searchParams.get("include")?.split(",").map(Number) || [],
    exclude: searchParams.get("exclude")?.split(",").map(Number) || [],
  };

  // Если нет ни одного фильтра, запрашиваем все рецепты
  const hasFilters = Object.values(queryParams).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined,
  );

  const { data, isLoading, error } = trpc.getSearchedRecepies.useQuery(
    queryParams,
    { enabled: hasFilters }, // если фильтров нет, запрос не выполнится
  );

  const allRecipes = trpc.getRecepies.useQuery(undefined, {
    enabled: !hasFilters, // если фильтров нет, берём все рецепты
  });
  const recepies = hasFilters ? data : allRecipes.data;
  if (isLoading || allRecipes.isLoading) return <Load />;
  if (error || allRecipes.error) return <Err />;

  return (
    <>
      <Header />
      <div>
        <div className="container" style={{ flex: 1 }}>
          <h1>Все рецепты</h1>
          {user ? (
            <a href="/recipes/add" className="btn btn-primary">
              Добавить новый рецепт
            </a>
          ) : (
            <></>
          )}
          {recepies.length === 0 ? (
            <div className="empty-state">
              <p>Рецептов пока нет. Будьте первым, кто добавит рецепт!</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {recepies.map((recipe) => (
                <RecipeCard
                  key={recipe.idrecipe}
                  userId={recipe.userId}
                  id={recipe.idrecipe}
                  img_url={recipe.img_url}
                  title={recipe.title}
                  author={recipe.author}
                  cuisine={recipe.cuisine}
                  typeCooking={recipe.typeCooking}
                  category={recipe.category}
                  cookingTime={recipe.cookingTime}
                  servings={recipe.servings}
                  difficulty={recipe.difficulty}
                  description={recipe.description}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
