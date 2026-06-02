import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { trpc } from "../lib/trpc";
import { Sidebar } from "../components/Sidebar";
import type {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";
import { useFormik } from "formik";
import { useSearchParams } from "react-router-dom";
import { Load } from "../components/Load";
import { Err } from "../components/Err";

export const ListOfUsers = () => {
  const [searchParams] = useSearchParams();
  const queryParams = {
    username: searchParams.get("username") || undefined,
  };

  // Если нет ни одного фильтра, запрашиваем все рецепты
  const hasFilters = Object.values(queryParams).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined,
  );

  const { data, isLoading, error } = trpc.getSearchedUsers.useQuery(
    queryParams,
    { enabled: hasFilters }, // если фильтров нет, запрос не выполнится
  );

  const allUsers = trpc.getUsers.useQuery(undefined, {
    enabled: !hasFilters, // если фильтров нет, берём все рецепты
  });

  const users = hasFilters ? data : allUsers.data;
  console.log(users);

  const formik = useFormik({
    initialValues: {
      username: "",
    },
    validate: (values) => {},
    onSubmit: async () => {
      const params = new URLSearchParams();
      if (formik.values.username)
        params.append("username", formik.values.username);
      window.location.href = `/users?${params.toString()}`;
    },
  });

  if (isLoading || allUsers.isLoading) return <Load />;
  if (error || allUsers.error) return <Err />;
  return (
    <>
      <Header />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <Sidebar />
        <div className="container" style={{ flex: 1 }}>
          <h1>Список пользователей</h1>
          <div className="search-box">
            <form onSubmit={formik.handleSubmit}>
              <input
                className="form-control me-2"
                type="text"
                placeholder="Найти пользователя"
                aria-label="Search"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
              <button type="submit" className="btn">
                Найти
              </button>
            </form>
          </div>
          <div className="user-actions"></div>
          {users.length == 0 ? (
            <div className="empty-state">
              <p>Пользователей пока нет</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map(
                (user: {
                  name:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  email:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  id: any;
                }) => (
                  <div className="user-card">
                    <h3>{user.name}</h3>
                    <p>
                      Email: <span>{user.email}</span>
                    </p>
                    {/* <p>Рецептов: <span>{#lists.size(user.recipes)}</span></p> */}

                    <div className="user-actions">
                      <a href={`/users/${user.id}`} className="btn btn-sm">
                        Профиль
                      </a>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
