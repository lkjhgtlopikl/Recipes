import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";

const schema = z
  .object({
    username: z
      .string()
      .min(3, "Минимум 3 символа")
      .max(16, "Максимум 16 символов"),
    email: z.string().email("Некорректный email"),
    password: z.string().min(6, "Минимум 6 символов"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export const Register = () => {
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values.username, values.email, values.password);
      window.location.replace("/");
    } catch (err: any) {
      setError("root", { message: err.message || "Ошибка регистрации" });
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Регистрация</h2>
        <label>
          Имя пользователя
          <input type="text" {...register("username")} />
          {errors.username && (
            <p className="alert alert-danger">{errors.username.message}</p>
          )}
        </label>
        <label>
          Email
          <input type="email" {...register("email")} />
          {errors.email && (
            <p className="alert alert-danger">{errors.email.message}</p>
          )}
        </label>
        <label>
          Пароль
          <input type="password" {...register("password")} />
          {errors.password && (
            <p className="alert alert-danger">{errors.password.message}</p>
          )}
        </label>
        <label>
          Повторите пароль
          <input type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && (
            <p className="alert alert-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </label>
        {errors.root && (
          <p className="alert alert-danger">{errors.root.message}</p>
        )}
        <button type="submit" className="btn" disabled={isSubmitting}>
          Зарегистрироваться
        </button>
        <a href="/users/login" className="btn btn-outline">
          Войти
        </a>
      </form>
    </div>
  );
};
