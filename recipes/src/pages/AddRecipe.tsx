import { trpc } from "../lib/trpc";
import { useEffect } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { Img } from "../components/Img";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { TextArea } from "../components/TextArea";
import { Load } from "../components/Load";
import { Err } from "../components/Err";

export const AddRecipe = () => {
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

  // Мутация добавления рецепта
  const addRecipeMutation = trpc.addRecipe.useMutation();
  useEffect(() => {
    if (addRecipeMutation.isSuccess) {
      window.location.href = "/recipes";
    }
  }, [addRecipeMutation.isSuccess]);

  const formik = useFormik({
    initialValues: {
      title: "",
      img_url: "",
      cuisine_id: "",
      typeCooking_id: "",
      category_id: "",
      menu_id: "",
      cookingTime: "",
      servings: "",
      difficulty: "",
      description: "",
      calories: "",
      fat: "",
      carbohydrates: "",
      ingredients: [
        {
          ingredient_id: "",
          quantity: 0,
          unit: "",
          calories: 0,
          protein: 0,
          fat: 0,
          carbohydrates: 0,
        },
      ],
      steps: [{ image: "", description: "" }],
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.title) errors.title = "Введите название блюда";
      if (!values.cuisine_id) errors.cuisine_id = "Выберите кухню";
      if (!values.typeCooking_id)
        errors.typeCooking_id = "Выберите тип приготовления";
      if (!values.category_id) errors.category_id = "Выберите категорию";
      if (!values.menu_id) errors.menu_id = "Выберите меню";
      if (!values.cookingTime)
        errors.cookingTime = "Введите время приготовления";
      if (!values.servings) errors.servings = "Введите количество порций";
      if (!values.difficulty) errors.difficulty = "Выберите сложность";
      if (!values.description) errors.description = "Введите описание";
      return errors;
    },
    onSubmit: async (values) => {
      const payload = {
        title: values.title,
        cookingTime: Number(values.cookingTime),
        servings: Number(values.servings),
        difficulty: values.difficulty as "1" | "2" | "3" | "4" | "5", // ENUM строка '1'...'5'
        description: values.description,
        category_id: Number(values.category_id),
        cuisine_id: Number(values.cuisine_id),
        menu_id: Number(values.menu_id),
        typeCooking_id: Number(values.typeCooking_id),
        img_url: values.img_url || null,

        ingredients: values.ingredients.map((ing) => ({
          ingredient_id: Number(ing.ingredient_id),
          quantity: Number(ing.quantity),
          unit: ing.unit,
          calories: (ing.calories * ing.quantity) / 100,
          fat: (ing.fat * ing.quantity) / 100,
          carbohydrates: (ing.carbohydrates * ing.quantity) / 100,
        })),
        calories: values.ingredients.reduce(
          (acc, ing) => acc + ing.calories,
          0,
        ),
        fat: values.ingredients.reduce((acc, ing) => acc + ing.fat, 0),
        carbohydrates: values.ingredients.reduce(
          (acc, ing) => acc + ing.carbohydrates,
          0,
        ),
        steps: values.steps.map((step) => ({
          image: step.image || null,
          description: step.description,
        })),
      };
      try {
        await addRecipeMutation.mutateAsync(payload);
      } catch (error) {
        console.error("Ошибка добавления рецепта:", error);
        alert(error instanceof Error ? error.message : "Ошибка сохранения");
      }
    },
  });

  if (cuisinesLoading || typesLoading) {
    return <Load />;
  }
  if (cuisinesError || typesError) {
    return <Err />;
  }

  // Подготовка данных для Select (value = id, label = name)
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
      value: i.ingredients_id,
      label: i.name,
      calories: i.calories,
      protein: i.protein,
      fat: i.fat,
      carbohydrates: i.carbohydrates,
    })) ?? [];
  const unitOptions = dataUnits?.map((i) => ({ value: i, label: i })) ?? [];
  const difficultyOptions = [
    { value: "1", label: "Очень легко" },
    { value: "2", label: "Легко" },
    { value: "3", label: "Средне" },
    { value: "4", label: "Сложно" },
    { value: "5", label: "Очень сложно" },
  ];

  const handleIngredientChange = (index: number, selectedId: string) => {
    formik.setFieldValue(`ingredients.${index}.ingredient_id`, selectedId);

    const ingredient = ingredientOptions.find(
      (opt) => opt.value === selectedId,
    );
    if (ingredient) {
      formik.setFieldValue(
        `ingredients.${index}.calories`,
        ingredient.calories ?? 0,
      );
      formik.setFieldValue(
        `ingredients.${index}.protein`,
        ingredient.protein ?? 0,
      );
      formik.setFieldValue(`ingredients.${index}.fat`, ingredient.fat ?? 0);
      formik.setFieldValue(
        `ingredients.${index}.carbohydrates`,
        ingredient.carbohydrates ?? 0,
      );
    }
  };

  return (
    <div className="container">
      <h1>Добавить новый рецепт</h1>
      <form className="form" onSubmit={formik.handleSubmit}>
        <Input
          name="title"
          type="text"
          label="Название рецепта:*"
          placeholder="Введите название рецепта"
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
                        placeholder="Выберите ингредиент"
                        formik={formik}
                      />
                      <Input
                        name={`ingredients.${index}.quantity`}
                        type="number"
                        label="Количество"
                        placeholder="Укажите количество"
                        formik={formik}
                      />
                      <Select
                        name={`ingredients.${index}.unit`}
                        label="Единицы измерения"
                        list={unitOptions}
                        placeholder="Выберите единицы"
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
                        quantity: "",
                        unit: "",
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
          placeholder="Краткое описание рецепта"
          formik={formik}
        />

        <div className="form-group">
          <label>Инструкции приготовления:*</label>
          <FormikProvider value={formik}>
            <FieldArray
              name="steps"
              render={(arrayHelpers) => (
                <>
                  {formik.values.steps.map((_step, index) => (
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
            min={1}
          />
          <Input
            name="servings"
            type="number"
            label="Количество порций:*"
            placeholder="4"
            formik={formik}
            min={1}
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
          <div>
            <Select
              name="menu_id"
              label="Меню:*"
              list={menuOptions}
              formik={formik}
              placeholder="Выберите меню"
            />
            <div>
              {" "}
              <a href="/menu"> Что за столы такие?</a>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Фото блюда:</label>
            <Img
              currentUrl={formik.values.img_url}
              onUploaded={(url) => formik.setFieldValue("img_url", url)}
              folder="recipes"
            />
          </div>
          <Select
            name="category_id"
            label="Категория:*"
            list={categoryOptions}
            formik={formik}
            placeholder="Выберите категория"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={formik.isSubmitting || addRecipeMutation.isPending}
            className="btn btn-primary"
          >
            {addRecipeMutation.isPending
              ? "Сохраняем рецепт..."
              : "Сохранить рецепт"}
          </button>
          <a href="/recipes" className="btn btn-outline">
            Отмена
          </a>
        </div>
      </form>
    </div>
  );
};
