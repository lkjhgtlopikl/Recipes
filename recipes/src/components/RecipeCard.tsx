import { useAuth } from "../context/AuthContext";
import { trpc } from "../lib/trpc";
import { Meta } from "./Meta";

interface RecipeCardProps {
  id: number;
  title: string;
  img_url: string;
  userId: number;
  author: string;
  cuisine: string;
  typeCooking: string;
  category: string;
  cookingTime: string;
  servings: string;
  difficulty: string;
  description: string;
}
export const RecipeCard = (props: RecipeCardProps) => {
  const utils = trpc.useContext();
  const { user } = useAuth();
  const delRecipeMutation = trpc.delRecipe.useMutation({
    onSuccess: () => {
      utils.getUserRecepies.invalidate();
    },
  });
  const { data: dataRatings } = trpc.getRatings.useQuery(
    { id: props.id! },
    { enabled: !!props.id },
  );
  const rating = dataRatings?.[0]?.mark ?? 0;
  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить рецепт?")) return;

    try {
      await delRecipeMutation.mutateAsync({ id: props.id });
      // Опционально: показать уведомление об успехе
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить рецепт");
    }
  };

  return (
    <>
      <div className="recipe-card">
        <h3>{props.title}</h3>
        <a href={`/users/${props.userId}`}>{props.author}</a>
        <div className="recipe-image">
          <img src={props.img_url} />
        </div>
        <p className="description">{props.description}</p>
        <div className="recipe-meta">
          <Meta name={"Оценка"} value={rating} />
          <Meta name={"Время"} value={props.cookingTime} />
          <Meta name={"Порции"} value={props.servings} />
          <Meta name={"Сложность"} value={props.difficulty} />
        </div>
        <div className="recipe-actions">
          <a href={`/recipes/${props.id}`} className="btn btn-sm">
            Подробнее
          </a>
          {user?.id == props.userId ? (
            <a
              href={`/recipes/edit/${props.id}`}
              className="btn btn-sm btn-secondary"
            >
              Редактировать
            </a>
          ) : (
            <></>
          )}

          {user?.id == props.userId && user ? (
            <button onClick={handleDelete} className="btn btn-sm btn-danger">
              Удалить
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};
