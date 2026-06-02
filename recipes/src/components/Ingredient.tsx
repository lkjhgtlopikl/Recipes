interface IngredientProps {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  quantity: number;
  units: string;
}
export const Ingredient = (props: IngredientProps) => {
  return (
    <div className="ingredient">
      <div className="alert alert-light">{props.name}</div>
      <div className="alert alert-light">
        {props.quantity} {props.units}
      </div>
      <div className="alert alert-success">
        Калории: {(props.calories * props.quantity) / 100}{" "}
      </div>
      <div className="alert alert-primary">
        Белки: {(props.protein * props.quantity) / 100}
      </div>
      <div className="alert alert-secondary">
        Жиры: {(props.fat * props.quantity) / 100}
      </div>
      <div className="alert alert-dark">
        Углеводы: {(props.carbohydrates * props.quantity) / 100}
      </div>
    </div>
  );
};
