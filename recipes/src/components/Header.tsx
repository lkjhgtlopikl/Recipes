import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { trpc } from "../lib/trpc";
import { useFormik } from "formik";
import type { title } from "process";
export const Header = () => {
  const { user, isLoading, logout } = useAuth();
  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const utils = trpc.useContext();

  // const formik = useFormik({
  //   initialValues: {
  //     title: "",
  //   },
  //   validate: (values) => {
  //     const errors: Record<string, string> = {};
  //     if (!values.title) errors.title = "Введите название кулинарной книги";
  //     return errors;
  //   },
  //   onSubmit: async (values) => {
  //     window.location.href = `/search?q=${encodeURIComponent(values.title)}`;
  //   },
  // });

  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validate: (values) => {},
    onSubmit: async () => {
      const params = new URLSearchParams();
      if (formik.values.title) params.append("title", formik.values.title);
      window.location.href = `/recipes?${params.toString()}`;
    },
  });

  if (isLoading) {
    return <>Loading...</>;
  } else {
    return (
      <header>
        <nav className="navbar">
          <div className="nav-brand">
            <a href="/" className="nav-brand-a">
              Кулинарная книга
            </a>
          </div>
          <div className="d-flex">
            <form onSubmit={formik.handleSubmit} className="d-flex">
              <input
                className="form-control me-2"
                type="text"
                placeholder="Найти рецепт"
                aria-label="Search"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
              />
              <button type="submit" className="btn btn-outline-success">
                Найти
              </button>
              <a href="/recipes/search" className="btn">
                Развернутый поиск
              </a>
            </form>
            {!user ? (
              <div className="nav-menu">
                <a href="/users/login">Войти</a>
                <a href="/users/register"> Зарегистрироваться</a>
              </div>
            ) : (
              <div className="nav-menu">
                <a href={`/users/${user.id}`}>{user.username}</a>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
    );
  }
};
