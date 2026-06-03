import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Load } from "../components/Load";
import { Err } from "../components/Err";
import { RecipeCard } from "../components/RecipeCard";
import { Sidebar } from "../components/Sidebar";
import { trpc } from "../lib/trpc";

export const Main = () => {
  // const { user } = useAuth();
  // const { data, isLoading, error } = trpc.getRecomendetRecepies.useQuery({ id: user?.id },
  //   { enabled: !! },);
  const { data, isLoading, error } = trpc.getRecepies.useQuery();
  if (isLoading) return <Load />;
  if (error) return <Err />;
  const recepies = data ?? [];
  return (
    <>
      <Header />
      <div className="image">
        <h1>Кулинарная книга</h1>
        <h3>Создайте свою коллекцию любимых рецептов</h3>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <div className="container" style={{ flex: 1 }}>
          {recepies.lenght === 0 ? (
            <div className="empty-state">
              <p>Рецептов пока нет. Будьте первым, кто добавит рецепт!</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {recepies.map((recipe, i) => (
                <RecipeCard
                  id={recipe.id}
                  image={recipe.image}
                  title={recipe.title}
                  author={recipe.author}
                  cuisine={recipe.cuisine}
                  typeCooking={recipe.typeCooking}
                  category={recipe.category}
                  cookingTime={recipe.cookingTime}
                  servings={recipe.servings}
                  difficulty={recipe.difficulty}
                  description={recipe.description} 
                  userId={recipe.userId}                ></RecipeCard>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
