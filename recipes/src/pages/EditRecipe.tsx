import { useFormik, FieldArray, FormikProvider } from "formik";
import { useParams } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { TextArea } from "../components/TextArea";
import { Load } from "../components/Load";
import { Err } from "../components/Err";
import { id } from "zod/locales";
import { Img } from "../components/Img";
export const EditRecipe = () => {
  const { r } = useParams<{ r: string }>();
  const idrecipe = Number(r);
  const {
    data: recipeData,
    isLoading: recipeLoading,
    error: recipeError,
  } = trpc.getRecepie.useQuery({ id: idrecipe }, { enabled: !!r });
  const { data: stepsData } = trpc.getSteps.useQuery(
    { id: idrecipe },
    { enabled: !!r },
  );
  const { data: ingredientsData } = trpc.getIngredients.useQuery(
    { id: idrecipe },
    { enabled: !!r },
  );
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
  const { data: dataUnits } = trpc.getUnits.useQuery();
  const { data: dataMenu } = trpc.getMenu.useQuery();
  const updateRecipeMutation = trpc.updateRecipe.useMutation({
    onSuccess: () => {
      window.location.href = `/recipes/${idrecipe}`;
    },
  });
  const recipe = recipeData?.[0] ?? {
    title: "",
    cookingTime: 30,
    servings: 4,
    difficulty: "1",
    description: "",
    category_id: 1,
    cuisine_id: 1,
    menu_id: 1,
    typeCooking_id: 1,
    img_url: "",
    userId: 0,
    author: "",
  };
  const steps = (stepsData as any[]) ?? [];
  const ingredients = (ingredientsData as any[]) ?? [];
  const cuisineOptions =
    dataCuisines?.map((c) => ({
      value: String(c.cuisine_id),
      label: c.name,
    })) ?? [];
  const typeOptions =
    dataTypes?.map((t) => ({ value: t.typeCooking_id, label: t.name })) ?? [];
  const categoryOptions =
    dataCategory?.map((c) => ({ value: c.category_id, label: c.name })) ?? [];
  const menuOptions =
    dataMenu?.map((m) => ({ value: m.menu_id, label: m.name })) ?? [];
  const ingredientOptions =
    dataIngredients?.map((i) => ({
      value: i.ingredient_id,
      label: i.name,
      calories: i.calories,
      protein: i.protein,
      fat: i.fat,
      carbohydrates: i.carbohydrates,
    })) ?? [];
  const unitOptions = dataUnits?.map((u) => ({ value: u, label: u })) ?? [];
  const difficultyOptions = [
    { value: "1", label: "Очень легко" },
    { value: "2", label: "Легко" },
    { value: "3", label: "Средне" },
    { value: "4", label: "Сложно" },
    { value: "5", label: "Очень сложно" },
  ];
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: recipe.title || "",
      cookingTime: recipe.cookingTime || 30,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || "1",
      description: recipe.description || "",
      category_id: recipe.category_id || 1,
      cuisine_id: recipe.cuisine_id || 1,
      menu_id: recipe.menu_id || 1,
      typeCooking_id: recipe.typeCooking_id || 1,
      img_url: recipe.img_url || "",
      ingredients: ingredients.map((ing: any) => ({
        id: ing.id,
        ingredient_id: ing.ingredient_id ?? null,
        quantity: ing.quantity ?? 0,
        unit: ing.unit ?? "г",
        calories: ing.calories ?? 0,
        fat: ing.fat ?? 0,
        carbohydrates: ing.carbohydrates ?? 0,
      })),
      steps: steps.map((step: any) => ({
        id: step.id,
        image: step.image ?? step.img_url ?? "",
        description: step.text ?? step.description ?? "",
      })),
    },
    onSubmit: async (values) => {
      const payload = {
        idrecipe,
        title: values.title,
        cookingTime: Number(values.cookingTime),
        servings: Number(values.servings),
        difficulty: values.difficulty,
        description: values.description,
        category_id: Number(values.category_id),
        cuisine_id: Number(values.cuisine_id),
        menu_id: Number(values.menu_id),
        typeCooking_id: Number(values.typeCooking_id),
        img_url: values.img_url || null,
        ingredients: values.ingredients.map((ing) => ({
          id: Number(ing.id),
          ingredient_id: Number(ing.ingredient_id),
          quantity: Number(ing.quantity),
          unit: ing.unit,
          calories: (ing.calories * ing.quantity) / 100,
          fat: (ing.fat * ing.quantity) / 100,
          carbohydrates: (ing.carbohydrates * ing.quantity) / 100,
        })),
        steps: values.steps.map((step) => ({
          id: Number(step.id),
          image: step.image || null,
          description: step.description,
        })),
      };
      try {
        console.log(payload);
        await updateRecipeMutation.mutateAsync(payload);
      } catch (error) {
        console.error("Ошибка обновления рецепта:", error);
        alert(error instanceof Error ? error.message : "Ошибка сохранения");
      }
    },
  });
  if (cuisinesLoading || typesLoading) return <Load />;
  if (cuisinesError || typesError) return <Err />;
  if (recipeLoading) return <Load />;
  if (recipeError) return <Err />;
  return (
    <div className="container">
      <h1>Редактировать рецепт</h1>
      <form onSubmit={formik.handleSubmit}>
        <Input
          name="title"
          type="text"
          label="Название рецепта:*"
          placeholder="Введите название"
          formik={formik}
        />
        <div className="card p-2 border-secondary">
          <label>Ингредиенты</label>
          <FormikProvider value={formik}>
            <FieldArray
              name="ingredients"
              render={(arrayHelpers) => (
                <>
                  {formik.values.ingredients.map((ing, index) => (
                    <div className="form-row-ingredient" key={index}>
                      <Select
                        name={`ingredients.${index}.ingredient_id`}
                        label={`Ингредиент ${index + 1}`}
                        list={ingredientOptions}
                        value={ing.ingredient_id}
                        placeholder="Выберите ингредиент"
                        formik={formik}
                      />
                      <Input
                        name={`ingredients.${index}.quantity`}
                        type="number"
                        label="Количество"
                        placeholder=""
                        value={ing.quantity}
                        formik={formik}
                      />
                      <Select
                        name={`ingredients.${index}.unit`}
                        label="Ед. измерения"
                        list={unitOptions}
                        placeholder=""
                        value={ing.unit}
                        formik={formik}
                      />
                      {formik.values.ingredients.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger-ingredient"
                          onClick={() => arrayHelpers.remove(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      arrayHelpers.push({
                        ingredient_id: "",
                        quantity: 0,
                        unit: "г",
                        calories: 0,
                        fat: 0,
                        carbohydrates: 0,
                      })
                    }
                  >
                    + Добавить ингредиент
                  </button>
                </>
              )}
            />
          </FormikProvider>
        </div>
        <TextArea
          name="description"
          label="Описание:*"
          placeholder="Краткое описание"
          formik={formik}
        />
        <div className="form-group">
          <label>Инструкции приготовления:*</label>
          <FormikProvider value={formik}>
            <FieldArray
              name="steps"
              render={(arrayHelpers) => (
                <>
                  {formik.values.steps.map((step, index) => (
                    <div className="step" key={index}>
                      <label>Шаг {index + 1}:</label>
                      <label>Фото:</label>
                      <Img
                        currentUrl={formik.values.steps[index].image}
                        onUploaded={(url) =>
                          formik.setFieldValue(`steps.${index}.image`, url)
                        }
                        folder="steps"
                      />
                      <label>Описание:</label>
                      <textarea
                        required
                        placeholder="Подробные инструкции"
                        value={formik.values.steps[index].description}
                        onChange={formik.handleChange}
                        name={`steps.${index}.description`}
                      />
                      {formik.values.steps.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => arrayHelpers.remove(index)}
                        >
                          Удалить шаг
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() =>
                      arrayHelpers.push({ image: "", description: "" })
                    }
                  >
                    + Добавить шаг
                  </button>
                </>
              )}
            />
          </FormikProvider>
        </div>
        <div className="form-row">
          <Input
            name="cookingTime"
            type="number"
            label="Время приготовления (мин):*"
            placeholder="30"
            formik={formik}
          />
          <Input
            name="servings"
            type="number"
            label="Количество порций:*"
            placeholder="4"
            formik={formik}
          />
        </div>
        <div className="form-row">
          <Select
            name="difficulty"
            label="Сложность:*"
            list={difficultyOptions}
            formik={formik}
            placeholder="Выберите сложность"
          />
          <Select
            name="cuisine_id"
            label="Кухня:*"
            list={cuisineOptions}
            formik={formik}
            placeholder="Выберите кухню"
          />
        </div>
        <div className="form-row">
          <Select
            name="typeCooking_id"
            label="Тип приготовления:*"
            list={typeOptions}
            formik={formik}
            placeholder="Выберите тип"
          />
          <Select
            name="menu_id"
            label="Меню:*"
            list={menuOptions}
            formik={formik}
            placeholder="Выберите меню"
          />
        </div>
        <div className="form-row">
          <label>Фото блюда:</label>
          <Img
            currentUrl={formik.values.img_url}
            onUploaded={(url) => formik.setFieldValue("img_url", url)}
            folder="recipes"
          />
          <Select
            name="category_id"
            label="Категория:*"
            list={categoryOptions}
            formik={formik}
            placeholder="Выберите категорию"
          />
        </div>
        <div className="form-actions">
          <button
            type="submit"
            disabled={formik.isSubmitting || updateRecipeMutation.isPending}
            className="btn btn-primary"
          >
            {updateRecipeMutation.isPending
              ? "Сохраняем..."
              : "Сохранить изменения"}
          </button>
          <a href="/recipes" className="btn btn-outline">
            Отмена
          </a>
        </div>
      </form>
    </div>
  );
};
