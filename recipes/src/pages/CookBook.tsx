import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { trpc } from "../lib/trpc"; // TrpcProvider больше не импортируем
import { RecipeCard } from "../components/RecipeCard";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Load } from "../components/Load";
import { Err } from "../components/Err";
export const CookBook = () => {
  const { user } = useAuth();
  const { bookId } = useParams<{ bookId: string }>();
  const id = Number(bookId);
  const utils = trpc.useContext();
  const { data, isLoading, error } = trpc.getCookBook.useQuery(
    { id: id! },
    { enabled: !!id },
  );
  const delRecipeToCookBookMutation = trpc.delRecipeToCookBook.useMutation({
    onSuccess: () => {
      utils.invalidate(); // сброс кэша
      window.location.href = `/users/${user?.id}/cookbook/${book.cook_book_id}`;
    },
  });

  const handleDeleteRecipeToCookBook = async (
    cook_book_id: number,
    idrecipe: number,
  ) => {
    if (
      !window.confirm(
        "Вы уверены, что хотите удалить рецепт из кулинарной книги?",
      )
    )
      return;
    try {
      await delRecipeToCookBookMutation.mutateAsync({
        cook_book_id: cook_book_id,
        idrecipe: idrecipe,
      });
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить рецепт из кулинарной книги");
    }
  };
  if (isLoading) return <Load />;
  if (error) return <Err />;
  const book = data[0] ?? [];
  return (
    <>
      <Header />

      <div>
        <div className="container" style={{ flex: 1 }}>
          <h1>{book.title}</h1>
          <div className="search-box">
            <form action="recipes/search" method="get">
              <input type="text" name="query" placeholder="Поиск рецептов..." />
              <button type="submit" className="btn">
                Найти
              </button>
              <button type="submit" className="btn">
                Развернутый поиск
              </button>
            </form>
          </div>
          {book.recipes[0].id === null ? (
            <div className="empty-state">
              <p>Рецептов пока нет.</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {book.recipes.map((recipe, i) => (
                <div>
                  <RecipeCard
                    id={recipe.id}
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
                  {user?.id == book.userId ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteRecipeToCookBook(
                          book.cook_book_id,
                          recipe.id,
                        )
                      }
                      className="btn btn-danger"
                    >
                      Удалить из кулинарной книги
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
