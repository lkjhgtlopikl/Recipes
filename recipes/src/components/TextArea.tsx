import type { FormikProps } from "formik";

interface Input {
  name: string;
  label: string;
  placeholder: string;
  formik: FormikProps<any>;
}
export const TextArea = (props: Input) => {
  const error = props.formik.errors[props.name] as string | undefined;
  return (
    <>
      <div className="form-group">
        <label>{props.label}</label>
        <textarea
          placeholder={props.placeholder}
          name={props.name}
          onChange={(e) =>
            props.formik.setFieldValue(props.name, e.target.value)
          }
          onBlur={props.formik.handleBlur}
          disabled={props.formik.isSubmitting}
          value={props.formik.values[props.name]}
        />
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
      </div>
    </>
  );
};
