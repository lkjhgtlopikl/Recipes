import { useMemo } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { RecipeCard } from "../components/RecipeCard";
import { trpc } from "../lib/trpc";
import { useAuth } from "../context/AuthContext";

export const Main = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const { data: dataPopular } = trpc.getPopularRecipes.useQuery();
  const pop = dataPopular ?? [];
  const popularRecipes = (pop as any[]).map((p) => p.recipes);
  const { data: popRecipes } = trpc.getSomeRecepies.useQuery(
    { ids: popularRecipes },
    { enabled: popularRecipes.length > 0 },
  );
  const popular = popRecipes ?? [];
  const { data: dataMeta } = trpc.getRecomendetMeta.useQuery(undefined, {
    enabled: isLoggedIn,
  });
  const { data: dataMenu } = trpc.getMenuOfUser.useQuery(
    { id: user?.id ?? 0 },
    { enabled: isLoggedIn && !!user?.id },
  );
  const { data: dataIngredients } = trpc.getRecomendetIngredients.useQuery(
    undefined,
    {
      enabled: isLoggedIn,
    },
  );
  const meta = dataMeta ?? [];
  const menuData = dataMenu ?? [];
  const ingredients = dataIngredients ?? [];
  const ing = useMemo(
    () => new Set(ingredients.map((i: any) => i.ingredients)),
    [ingredients],
  );
  const r = useMemo(
    () => [...new Set(meta.map((m: any) => m.idrecipe))],
    [meta],
  );
  const category = useMemo(
    () => [...new Set(meta.map((m: any) => m.category_id))],
    [meta],
  );
  const cuisine = useMemo(
    () => [...new Set(meta.map((m: any) => m.cuisine_id))],
    [meta],
  );
  const typecooking = useMemo(
    () => [...new Set(meta.map((m: any) => m.typeCooking_id))],
    [meta],
  );
  const menu = useMemo(() => menuData.map((m: any) => m.menu_id), [menuData]);
  const hasMenu = menu.length > 0;
  const { data: dataRecMenu } = trpc.getRecipesByMenu.useQuery(
    { recipes: r, category, cuisine, menu, typeCooking: typecooking },
    { enabled: isLoggedIn && hasMenu && r.length > 0 },
  );
  const { data: dataRecMeta } = trpc.getRecomendetByMeta.useQuery(
    { recipes: r, category, cuisine, typeCooking: typecooking },
    { enabled: isLoggedIn && !hasMenu && r.length > 0 },
  );
  const dataRec = hasMenu ? dataRecMenu : dataRecMeta;
  const rec = dataRec ?? [];
  const recIds = useMemo(() => rec.map((r: any) => r.idrecipe), [rec]);
  const { data: dataJCAll } = trpc.getJaccardAll.useQuery(
    { ids: recIds },
    { enabled: recIds.length > 0 },
  );
  const { data: dataJCUnion } = trpc.getJaccardUnion.useQuery(
    { ids: recIds, ing: [...ing] },
    { enabled: recIds.length > 0 && ing.size > 0 },
  );
  const recommend = useMemo(() => {
    if (!dataJCAll || !dataJCUnion || recIds.length === 0) return [];
    const all = (dataJCAll as any[]).map((r) => r[0].ingredients);
    const union = (dataJCUnion as any[]).map((r) => r[0].ingredients);
    const JC = all.map((_, i) => union[i] / (ing.size + all[i] - union[i]));
    const sum = JC.reduce((a, b) => a + b, 0);
    const avg = sum / JC.length;
    return recIds.filter((_, i) => JC[i] > avg);
  }, [dataJCAll, dataJCUnion, recIds, ing]);
  const { data: recommendedRecipes } = trpc.getSomeRecepies.useQuery(
    { ids: recommend },
    { enabled: recommend.length > 0 },
  );
  const recepies =
    !isLoggedIn || recommend.length === 0
      ? popular
      : (recommendedRecipes ?? []);
  return (
    <>
      <Header />
      <div className="image">
        <h1>Кулинарная книга</h1>
        <h3>Создайте свою коллекцию любимых рецептов</h3>
      </div>
      <div>
        <div className="container" style={{ flex: 1 }}>
          <h1>Возможно вам понравятся эти рецепты</h1>
          {recepies.length === 0 ? (
            <div className="empty-state">
              <p>Рецептов пока нет. Будьте первым, кто добавит рецепт!</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {recepies.map((recipe: any) => (
                <RecipeCard
                  key={recipe.idrecipe}
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
                  userId={recipe.userId}
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
