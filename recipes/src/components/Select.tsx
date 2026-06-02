import type { FormikProps } from "formik";
import type { ChangeEventHandler } from "react";
import { number } from "zod";

interface Input {
  name: string;
  label: string;
  value?: string;
  list: { value: string | number; label: string }[];
  placeholder: string;
  formik: FormikProps<any>;
  handle?: ChangeEventHandler<HTMLSelectElement, HTMLSelectElement>;
}
export const Select = (props: Input) => {
  const error = props.formik.errors[props.name] as string | undefined;
  return (
    <>
      <div className="form-group">
        <label>{props.label}</label>
        <select
          className="form-select"
          name={props.name}
          onChange={
            props.handle
              ? props.handle
              : (e) => props.formik.setFieldValue(props.name, e.target.value)
          }
          onBlur={props.formik.handleBlur}
          value={props.value ? props.value : props.formik.values[props.name]}
          disabled={props.formik.isSubmitting}
        >
          <option value="">{props.placeholder}</option>
          {props.list.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
      </div>
    </>
  );
};
