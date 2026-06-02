import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type LoginFormValues = z.infer<typeof schema>;

export const Login = () => {
  const { login: login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      window.location.replace("/");
    } catch (err: any) {
      setError("root", { message: err.message || "Ошибка авторизации" });
    }
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Аворизация</h2>
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
        <button type="submit" className="btn" disabled={isSubmitting}>
          Войти
        </button>
        <a href="/users/register" className="btn btn-outline">
          Зарегистрироваться
        </a>
      </form>
    </div>
  );
};
