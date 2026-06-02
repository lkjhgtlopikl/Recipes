import type { FormikProps } from "formik";
import type { ChangeEventHandler } from "react";

interface Input {
  name: string;
  type: string;
  label: string;
  min?: number;
  value?: string;
  placeholder: string;
  formik: FormikProps<any>;
  handle?: ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
}
export const Input = (props: Input) => {
  const error = props.formik.errors[props.name] as string | undefined;
  return (
    <>
      <div className="form-group">
        <label>{props.label}</label>
        <input
          type={props.type}
          min={props.min}
          value={props.value ? props.value : props.formik.values[props.name]}
          placeholder={props.placeholder}
          onChange={
            props.handle
              ? props.handle
              : (e) => props.formik.setFieldValue(props.name, e.target.value)
          }
          onBlur={props.formik.handleBlur}
          disabled={props.formik.isSubmitting}
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
