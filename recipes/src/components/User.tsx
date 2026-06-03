import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { trpc } from "../lib/trpc";
import { RecipeCard } from "./RecipeCard";
import { useParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Input } from "./Input";

export const User = () => {
  const [addBook, setState] = useState(false);
  const { user: currentUser } = useAuth();
  const utils = trpc.useContext();
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);

  const {
    data: dataUser,
    isLoading: userLoading,
    error: userError,
  } = trpc.getUser.useQuery({ id }, { enabled: !!id });

  const { data: dataCookBooks } = trpc.getCookBooks.useQuery(
    { id },
    { enabled: !!id },
  );

  const {
    data: recipes,
    isLoading: recipesLoading,
    error: recipesError,
  } = trpc.getUserRecepies.useQuery({ id }, { enabled: !!id });

  const delUserMutation = trpc.delUser.useMutation({
    onSuccess: () => {
      utils.invalidate(); // сброс кэша
      window.location.href = "/users";
    },
  });

  const handleDeleteUser = async () => {
    if (
      !window.confirm(
        "Вы уверены, что хотите удалить этого пользователя? Все его рецепты будут удалены безвозвратно!",
      )
    )
      return;
    try {
      await delUserMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить пользователя");
    }
  };
  const delCookBookMutation = trpc.delCookBook.useMutation({
    onSuccess: () => {
      utils.invalidate(); // сброс кэша
      // window.location.href = "/users/";
    },
  });

  const handleDeleteCookBook = async (cookbook: number) => {
    if (
      !window.confirm(
        "Вы уверены, что хотите удалить эту кулинарную книгу? Все его рецепты будут потеряны!",
      )
    )
      return;
    try {
      await delCookBookMutation.mutateAsync({ id: cookbook });
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить кулинарную книгу");
    }
  };

  const addCookBookMutation = trpc.addCookBook.useMutation();
  useEffect(() => {
    if (addCookBookMutation.isSuccess) {
      utils.getCookBooks.invalidate({ id: currentUser?.id });
      formik.resetForm();
      setState(false);
      window.location.href = `/users/${currentUser?.id}`;
    }
  }, [addCookBookMutation.isSuccess]);

  const formik = useFormik({
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

  if (userLoading || recipesLoading) return <div>Загрузка...</div>;
  if (userError) return <div>Ошибка: {userError.message}</div>;
  if (recipesError) return <div>Ошибка: {recipesError.message}</div>;

  const user = dataUser?.[0] ?? { id: 0, username: "", email: "" };
  const userRecipes = recipes ?? [];
  const cookBooks = dataCookBooks ?? [];

  return (
    <>
      <Header />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <div className="container" style={{ flex: 1 }}>
          <div className="profile">
            <h1>
              Профиль пользователя: <span>{user.username}</span>
            </h1>
            <div className="profile-info">
              <div className="info-item">
                <strong>Email:</strong> <span>{user.email}</span>
              </div>
              <div className="info-item">
                <strong>Количество рецептов:</strong>{" "}
                <span>{userRecipes.length}</span>
              </div>
              <div className="accordion" id="accordionExample">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-expanded="true"
                      aria-controls="collapseOne"
                    >
                      <strong>Кулинарные книги:</strong>{" "}
                      <span>{cookBooks.length}</span>
                    </button>
                  </h2>
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse show"
                    data-bs-parent="#accordionExample"
                  >
                    {cookBooks.length === 0 ? (
                      <>
                        {!addBook ? (
                          <div className="empty-state">
                            <p>У пользователя пока нет кулинарных книг.</p>
                          </div>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <div className="accordion-body">
                        {cookBooks.map((book: any) => (
                          <div className="form-row-ingredient-search ">
                            <a
                              key={book.id}
                              className="info-item"
                              href={`/users/${userId}/cookbook/${book.id}`}
                            >
                              <strong>{book.title}</strong>{" "}
                              <span>
                                {book.recipe[0] == null
                                  ? 0
                                  : book.recipe.length}
                              </span>
                            </a>
                            {currentUser?.id === id && (
                              <button
                                onClick={() => handleDeleteCookBook(book.id)}
                                className="btn btn-sm btn-danger"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {addBook ? (
                      <form onSubmit={formik.handleSubmit}>
                        <Input
                          name="title"
                          type="text"
                          label=""
                          placeholder="Введите название кулинарной книги"
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
                          disabled={
                            formik.isSubmitting || addCookBookMutation.isPending
                          }
                          className="btn btn-primary"
                        >
                          Добавить
                        </button>
                      </form>
                    ) : (
                      <></>
                    )}
                    {currentUser?.id === id && (
                      <button
                        onClick={() => setState(true)}
                        className="btn btn-sm btn-success"
                      >
                        Добавить кулинаркную книгу
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Рецепты пользователя */}
            <div className="user-recipes">
              <h2>Рецепты пользователя</h2>
              <div className="recipes-grid">
                {userRecipes.map((recipe: any) => (
                  <RecipeCard
                    key={recipe.id}
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
                    userId={id}
                  />
                ))}
              </div>
            </div>

            <div className="profile-actions">
              <a href="/users" className="btn btn-outline">
                К списку пользователей
              </a>
              <a href="/recipes" className="btn btn-outline">
                К рецептам
              </a>
              {currentUser?.id === id && (
                <button
                  onClick={handleDeleteUser}
                  className="btn btn-sm btn-danger"
                >
                  {delUserMutation.isLoading
                    ? "Удаление..."
                    : "Удалить профиль"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
