import { trpc } from "../lib/trpc";
import { useState } from "react";
import { useFormik } from "formik";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { number } from "zod/v3";
import { Load } from "../components/Load";
import { Err } from "../components/Err";

export const SearchRecipe = () => {
  const [ingrInclude, setIngredientsInclude] = useState<
    { value: number; label: string }[]
  >([{ value: 0, label: "" }]);
  const [ingrExclude, setIngredientsExclude] = useState<
    { value: number; label: string }[]
  >([{ value: 0, label: "" }]);
  const formik = useFormik({
    initialValues: {
      title: "",
      cuisine_id: 0,
      typeCooking_id: 0,
      category_id: 0,
      cookingTime: 0,
      difficulty: "",
      menu_id: 0,
    },
    validate: (values) => {},
    onSubmit: async () => {
      const params = new URLSearchParams();

      if (formik.values.title) params.append("title", formik.values.title);
      if (formik.values.cuisine_id)
        params.append("cuisine_id", formik.values.cuisine_id);
      if (formik.values.typeCooking_id)
        params.append("typeCooking_id", formik.values.typeCooking_id);
      if (formik.values.category_id)
        params.append("category_id", formik.values.category_id);
      if (formik.values.cookingTime)
        params.append("cookingTime", formik.values.cookingTime);
      if (formik.values.difficulty)
        params.append("difficulty", formik.values.difficulty);
      if (formik.values.menu_id)
        params.append("menu_id", formik.values.menu_id);

      const include = ingrInclude
        .filter((i) => i.value !== 0)
        .map((i) => i.value);
      const exclude = ingrExclude
        .filter((i) => i.value !== 0)
        .map((i) => i.value);

      if (include.length > 0) params.append("include", include.join(","));
      if (exclude.length > 0) params.append("exclude", exclude.join(","));

      window.location.href = `/recipes?${params.toString()}`;
    },
  });

  const addIngredientInclude = () => {
    setIngredientsInclude([...ingrInclude, { value: 0, label: "" }]);
  };
  const addIngredientExclude = () => {
    setIngredientsExclude([...ingrExclude, { value: 0, label: "" }]);
  };

  const removeIngredientInclude = (index: number) => {
    if (ingrInclude.length > 1) {
      setIngredientsInclude(ingrInclude.filter((_, i) => i !== index));
    }
  };
  const removeIngredientExclude = (index: number) => {
    if (ingrExclude.length > 1) {
      setIngredientsExclude(ingrExclude.filter((_, i) => i !== index));
    }
  };

  const updateIngredientInclude = (
    index: number,
    value: number,
    label: string,
  ) => {
    const newIngredients = [...ingrInclude];
    newIngredients[index] = { value, label };
    setIngredientsInclude(newIngredients);
  };
  const updateIngredientExclude = (
    index: number,
    value: number,
    label: string,
  ) => {
    const newIngredients = [...ingrExclude];
    newIngredients[index] = { value, label };
    setIngredientsExclude(newIngredients);
  };

  const {
    data: dataCuisines,
    isLoading: cuisinesLoading,
    error: cuisinesError,
  } = trpc.getCuisines.useQuery();
  const {
    data: dataTypes,
    isLoading: typesLoading,
    error: typesError,
  } = trpc.getTypes.useQuery();
  const { data: dataIngredients } = trpc.getAllIngredients.useQuery();
  const { data: dataCategory } = trpc.getCategory.useQuery();
  const { data: dataMenu } = trpc.getMenu.useQuery();
  if (cuisinesLoading || typesLoading) {
    return <Load />;
  }
  if (cuisinesError || typesError) {
    return <Err />;
  }
  const cuisines =
    dataCuisines?.map((c) => ({
      value: String(c.cuisine_id),
      label: c.name,
    })) ?? [];
  const types =
    dataTypes?.map((t) => ({ value: t.typeCooking_id, label: t.name })) ?? [];
  const ingredients =
    dataIngredients?.map((i) => ({
      value: i.ingredients_id,
      label: i.name,
    })) ?? [];
  const category =
    dataCategory?.map((c) => ({ value: c.category_id, label: c.name })) ?? [];
  const menuOptions =
    dataMenu?.map((m) => ({ value: m.menu_id, label: m.name })) ?? [];
  const difficultyOptions = [
    { value: "1", label: "Очень легко" },
    { value: "2", label: "Легко" },
    { value: "3", label: "Средне" },
    { value: "4", label: "Сложно" },
    { value: "5", label: "Очень сложно" },
  ];
  return (
    <div className="container ">
      <h1>Найти рецепт</h1>
      <form onSubmit={formik.handleSubmit}>
        <Input
          name={"title"}
          type={"text"}
          label={"Название рецепта:*"}
          placeholder={"Введите название рецепта"}
          formik={formik}
        />
        <div className="form-row">
          <div className="card p-2 border-success ">
            <label>Ингредиенты которые есть в блюде</label>
            {ingrInclude.map((ingI, i) => (
              <div className="form-row-ingredient-search" key={i}>
                <Select
                  name={`include-${i}`}
                  label={"Ингредиент " + (i + 1)}
                  list={ingredients}
                  placeholder={"Выберите ингредиенты"}
                  handle={(e) => {
                    const selectedId = Number(e.target.value);
                    const selected = ingredients.find(
                      (ing) => ing.value === selectedId,
                    );
                    if (selected) {
                      updateIngredientInclude(
                        i,
                        selected.value,
                        selected.label,
                      );
                    }
                  }}
                  formik={formik}
                />
                {ingrInclude.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger-ingredient"
                    onClick={() => removeIngredientInclude(i)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-x-lg"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-primary"
              onClick={addIngredientInclude}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                />
              </svg>
              Добавить еще один ингредиент
            </button>
          </div>
          <div className="card p-2 border-danger">
            <label>Ингредиенты которых нет</label>
            {ingrExclude.map((ingE, i) => (
              <div className="form-row-ingredient-search" key={i}>
                <Select
                  name={`exclude-${i}`}
                  label={"Ингредиент " + (i + 1)}
                  list={ingredients}
                  placeholder={"Выберите ингредиенты"}
                  handle={(e) => {
                    const selectedId = Number(e.target.value);
                    const selected = ingredients.find(
                      (ing) => ing.value === selectedId,
                    );
                    if (selected) {
                      updateIngredientExclude(
                        i,
                        selected.value,
                        selected.label,
                      );
                    }
                  }}
                  formik={formik}
                />

                {ingrExclude.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger-ingredient"
                    onClick={() => removeIngredientExclude(i)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-x-lg"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-primary"
              onClick={addIngredientExclude}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-plus-lg"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                />
              </svg>
              Добавить еще один ингредиент
            </button>
          </div>
        </div>
        <div className="form-row">
          <Input
            name={"cookingTime"}
            type={"number"}
            label={"Время приготовления (мин):*"}
            placeholder={"30"}
            formik={formik}
            min={0}
          />
          <Select
            name={"category"}
            label={"Категория:*"}
            list={category}
            formik={formik}
            placeholder={"Выберите категорию"}
          />
        </div>
        <div className="form-row">
          <Select
            name={"cuisine"}
            label={"Кухня:*"}
            list={cuisines}
            formik={formik}
            placeholder={"Выберите кухню"}
          />
          <Select
            name={"typeCooking"}
            label={"Тип приготовления:*"}
            list={types}
            formik={formik}
            placeholder={"Выберите тип приготовления"}
          />
        </div>
        <div className="form-row">
          <Select
            name={"menu"}
            label={"Меню:*"}
            list={menuOptions}
            formik={formik}
            placeholder={"Выберите меню"}
          />
          <Select
            name={"difficulty"}
            label={"Сложность:*"}
            list={difficultyOptions}
            formik={formik}
            placeholder={"Выберите сложность"}
          />
        </div>
        <div className="form-actions">
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="btn btn-primary"
          >
            {formik.isSubmitting ? "Ищем..." : "Найти рецепт"}
          </button>
          <a href="/recipes" className="btn btn-outline">
            Отмена
          </a>
        </div>
      </form>
    </div>
  );
};
