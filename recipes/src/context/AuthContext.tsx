import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type SetStateAction,
} from "react";
import { trpc } from "../lib/trpc";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });
  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
    // isLoading меняется на false, когда запрос завершён (успех или ошибка)
    if (!meQuery.isLoading) {
      setIsLoading(false);
    }
  }, [meQuery.data, meQuery.isLoading]);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const login = async (email: string, password: string) => {
    const data = await loginMutation.mutateAsync({ email, password });
    localStorage.setItem("authToken", data.token);
    setUser(data.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const data = await registerMutation.mutateAsync({
      username,
      email,
      password,
    });
    localStorage.setItem("authToken", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  return context;
};
