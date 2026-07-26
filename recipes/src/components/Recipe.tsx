import { useParams } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useState, useEffect } from "react";
import { Ingredient } from "./Ingredient";
import { Meta } from "./Meta";
import { useAuth } from "../context/AuthContext";
import { TextArea } from "./TextArea";
import { useFormik } from "formik";
import { Load } from "./Load";
import { Input } from "./Input";

export const Recipe = () => {
  const [selectedMark, setSelectedMark] = useState<number>(0);
  const [selectedCookBook, setSelectedCookBook] = useState<number>(0);
  const [addComment, setState] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  const { r } = useParams<{ r: string }>();
  const idrecipe = Number(r);
  const { data, isLoading, error } = trpc.getRecepie.useQuery(
    { id: idrecipe },
    { enabled: !!r },
  );
  const { data: dataSteps } = trpc.getSteps.useQuery(
    { id: idrecipe },
    { enabled: !!r },
  );
  const { data: dataIngredients } = trpc.getIngredients.useQuery(
    { id: idrecipe },
    { enabled: !!r },
  );
  const { data: dataComments } = trpc.getComments.useQuery(
    { id: idrecipe! },
    { enabled: !!r },
  );
  const { data: dataRatings } = trpc.getRatings.useQuery(
    { id: idrecipe! },
    { enabled: !!r },
  );
  const { data: dataCookBooks } = trpc.getCookBooks.useQuery(
    { id: user?.id! },
    { enabled: !!user?.id },
  );
  const CookBooks = dataCookBooks ?? [];
  const utils = trpc.useContext();

  const addCommentMutation = trpc.addComment.useMutation();
  useEffect(() => {
    if (addCommentMutation.isSuccess) {
      utils.getComments.invalidate({ id: idrecipe });
      formik.resetForm();
      setState(false);
      window.location.href = `/recipes/${idrecipe}`;
    }
  }, [addCommentMutation.isSuccess]);

  const formik = useFormik({
    initialValues: {
      text: "",
      idrecipe: idrecipe,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.text) errors.text = "Введите название кулинарной книги";
      return errors;
    },
    onSubmit: async (values) => {
      const payload = {
        text: values.text,
        idrecipe: idrecipe,
      };
      try {
        await addCommentMutation.mutateAsync(payload);
      } catch (error) {
        console.error("Ошибка добавления комментария:", error);
        alert(error instanceof Error ? error.message : "Ошибка сохранения");
      }
    },
  });

  const delCommentMutation = trpc.delComment.useMutation({
    onSuccess: () => {
      utils.invalidate(); // сброс кэша
      window.location.href = `/recipes/${idrecipe}`;
    },
  });

  const handleDeleteComment = async (comment: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот комментарий?"))
      return;
    try {
      await delCommentMutation.mutateAsync({ id: comment });
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить комментарй");
    }
  };
  const addRatingMutation = trpc.addRating.useMutation();
  useEffect(() => {
    if (addRatingMutation.isSuccess) {
      isMarked = true;
      utils.getCookBooks.invalidate({ id: user?.id });
      formik.resetForm();
      setState(false);
      window.location.href = `/recipes/${idrecipe}`;
    }
  }, [addRatingMutation.isSuccess]);
  const handleAddMark = async (mark: number, idrecipe: number) => {
    if (!mark) {
      alert("Выберите оценку");
      return;
    }
    try {
      await addRatingMutation.mutateAsync({ mark, idrecipe });
      utils.getRatings.invalidate({ id: idrecipe });
    } catch (error) {
      console.error("Ошибка добавления оценки:", error);
      alert("Не удалось добавить оценку");
    }
  };

  const delRatingMutation = trpc.delRating.useMutation({
    onSuccess: () => {
      utils.invalidate(); // сброс кэша
      window.location.href = `/recipes/${idrecipe}`;
    },
  });

  const handleDeleteRating = async (userId: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить оценку?")) return;
    try {
      await delRatingMutation.mutateAsync({ id: userId });
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить оценку");
    }
  };

  const AddRecipeToCookBookMutation = trpc.addRecipeToCookBook.useMutation();
  useEffect(() => {
    if (AddRecipeToCookBookMutation.isSuccess) {
      utils.getCookBooks.invalidate({ id: user?.id });
      window.location.href = `/recipes/${idrecipe}`;
    }
  }, [AddRecipeToCookBookMutation.isSuccess]);
  const handleAddRecipeToCookBook = async (
    cook_book_id: number,
    idrecipe: number,
  ) => {
    if (!cook_book_id) {
      alert("Выберите кулинарную книгу");
      return;
    }
    const book = CookBooks.find((b) => b.id === cook_book_id);
    if (book && book.recipe?.includes(idrecipe)) {
      alert("Вы уже добавили этот рецепт в кулинарную книгу!");
      return;
    }
    try {
      await AddRecipeToCookBookMutation.mutateAsync({ cook_book_id, idrecipe });
      // utils.getRatings.invalidate({ id: idrecipe });
    } catch (error) {
      console.error("Ошибка добавления рецепта в кулинарную книгу:", error);
      alert("Не удалось добавить рецепт в кулинарную книгу");
    }
  };

  const addCookBookMutation = trpc.addCookBook.useMutation();
  useEffect(() => {
    if (addCookBookMutation.isSuccess) {
      utils.getCookBooks.invalidate({ id: user?.id });
      formik.resetForm();
      setState(false);
      window.location.href = `/recipes/${idrecipe}`;
    }
  }, [addCookBookMutation.isSuccess]);
  const formikBook = useFormik({
    initialValues: {
      title: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.title) errors.title = "Введите название кулинарной книги";
      return errors;
    },
    onSubmit: async (values) => {
      const payload = {
        title: values.title,
      };
      try {
        await addCookBookMutation.mutateAsync(payload);
      } catch (error) {
        console.error("Ошибка добавления кулинарной книги:", error);
        alert(error instanceof Error ? error.message : "Ошибка сохранения");
      }
    },
  });

  if (isLoading) return <Load />;
  if (authLoading) {
    return <Load />;
  }
  if (error) return <div>Ошибка: {error.message}</div>;
  const recipe = data[0] ?? {
    id: "",
    title: "",
    img_url: "",
    userId: "",
    author: "",
    cuisine: "",
    typeCooking: "",
    category: "",
    cookingTime: "",
    servings: "",
    difficulty: "",
    description: "",
  };
  const steps = dataSteps ?? [
    { id: "", text: "", idRecipe: "", number: "", image: "" },
  ];
  const Comments = dataComments ?? [];
  const ing = dataIngredients ?? [{}];
  const rating = dataRatings[0] ?? { mark: 0, count: 0 };
  let isMarked = Array.isArray(rating.users) && rating.users.includes(user?.id);
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbohydrates = 0;
  for (let index = 0; index < ing.length; index++) {
    calories += ing[index].calories * (ing[index].quantity / 100);
    protein += ing[index].protein * (ing[index].quantity / 100);
    fat += ing[index].fat * (ing[index].quantity / 100);
    carbohydrates += ing[index].carbohydrates * (ing[index].quantity / 100);
  }
  const marks = [
    { value: 1, label: 1 },
    { value: 2, label: 2 },
    { value: 3, label: 3 },
    { value: 4, label: 4 },
    { value: 5, label: 5 },
  ];

  return (
    <>
      <Header />
      <div>
        <div className="container" style={{ flex: 1 }}>
          <div className="recipe-detail">
            <h1>{recipe.title}</h1>
            <div className="recipe-image">
              <img src={recipe.img_url} />
            </div>
            <div className="meta">
              <a href={`/users/${recipe.userId}`}>{recipe.author}</a>
            </div>
            <div className="recipe-meta">
              <Meta name={"Оценка"} value={rating.mark} />
              <Meta name={"Число оценок"} value={rating.count} />
              <Meta name={"Кухня"} value={recipe.cuisine} />
              <Meta name={"Тип"} value={recipe.typeCooking} />
              <Meta name={"Категория"} value={recipe.category} />
              <Meta name={"Время"} value={recipe.cookingTime} />
              <Meta name={"Порции"} value={recipe.servings} />
              <Meta name={"Сложность"} value={recipe.difficulty} />
              <Meta name={"меню"} value={recipe.menu} />
              <Meta name={"Калории"} value={calories.toFixed(2)} />
              <Meta name={"Белки"} value={protein.toFixed(2)} />
              <Meta name={"Жиры"} value={fat.toFixed(2)} />
              <Meta name={"Углеводы"} value={carbohydrates.toFixed(2)} />
            </div>
            <div className="card p-3">
              {ing.map((i) => (
                <Ingredient
                  name={i.name}
                  calories={i.calories.toFixed(2)}
                  protein={i.protein.toFixed(2)}
                  fat={i.fat.toFixed(2)}
                  carbohydrates={i.carbohydrates.toFixed(2)}
                  quantity={i.quantity}
                  units={i.units}
                />
              ))}
            </div>
            <div className="description">
              <h3>Описание</h3>
              <p>{recipe.description}</p>
            </div>
            <div className="instructions">
              <h3>Инструкции</h3>
              {steps.map((step) => (
                <>
                  <h4>Шаг {step.number}</h4>
                  <div className="recipe-image">
                    <img src={step.image} />
                  </div>
                  <p>{step.text}</p>
                </>
              ))}
            </div>
            <div className="actions form-row">
              {user?.id == recipe.userId ? (
                <a
                  href={`/recipes/edit/${idrecipe}`}
                  className="btn btn-secondary"
                >
                  Редактировать
                </a>
              ) : (
                <></>
              )}
              {user ? (
                <>
                  {isMarked ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteRating(user.id)}
                      className="btn btn-primary"
                    >
                      Удалить оценку
                    </button>
                  ) : (
                    <div className="form-row">
                      <select
                        value={selectedMark}
                        onChange={(e) =>
                          setSelectedMark(Number(e.target.value))
                        }
                        className="form-select"
                      >
                        <option value={0} disabled>
                          Оцените рецепт
                        </option>
                        {marks.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAddMark(selectedMark, idrecipe)}
                        className="btn btn-primary"
                      >
                        Оценить
                      </button>
                    </div>
                  )}
                  <div className="form-row">
                    <select
                      value={selectedCookBook}
                      onChange={(e) =>
                        setSelectedCookBook(Number(e.target.value))
                      }
                      className="form-select"
                    >
                      <option value={0} disabled>
                        Выберите кулинарную книгу
                      </option>
                      {CookBooks.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddRecipeToCookBook(selectedCookBook, idrecipe)
                      }
                      className="btn btn-secondary"
                    >
                      Добавить в кулинарную книгу
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    >
                      Создать новую кулинаркную книгу
                    </button>
                  </div>
                  <div
                    className="modal fade"
                    id="exampleModal"
                    tabindex="-1"
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h1
                            className="modal-title fs-5"
                            id="exampleModalLabel"
                          >
                            Создать новую кулинарную книгу
                          </h1>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          />
                        </div>
                        <div className="modal-body">
                          <form
                            className="form"
                            onSubmit={formikBook.handleSubmit}
                          >
                            <Input
                              name="title"
                              type="text"
                              label=""
                              placeholder="Введите название кулинарной книги"
                              formik={formikBook}
                            />
                            <button
                              type="submit"
                              disabled={
                                formikBook.isSubmitting ||
                                addCookBookMutation.isPending
                              }
                              className="btn btn-primary"
                            >
                              Добавить
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
              <a href="/recipes" className="btn btn-outline">
                Назад к списку
              </a>
            </div>
          </div>
          <h1>Комментари к рецепту: {recipe.title}</h1>
          {Comments.map((comment) => (
            <div className="card mb-3">
              <div className="row g-0">
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title">{comment.user}</h5>
                    <p className="card-text">{comment.text}</p>
                    <p className="card-text">
                      <small className="text-body-secondary">
                        Last updated 3 mins ago
                      </small>
                    </p>
                    {user?.id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Удалить комментарий
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {addComment ? (
            <form onSubmit={formik.handleSubmit}>
              <TextArea
                name="text"
                label=""
                placeholder="Введите текст комментария"
                formik={formik}
              />
              <button
                type="button"
                className="btn btn-danger-ingredient"
                onClick={() => setState(false)}
              >
                ✕
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting || addCommentMutation.isPending}
                className="btn btn-primary"
              >
                Отправить
              </button>
            </form>
          ) : (
            <></>
          )}
          {user ? (
            <button
              onClick={() => setState(true)}
              className="btn btn-sm btn-success"
            >
              Прокомментировать
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
