import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

const TOKEN_KEY = "token";

export const authService = {
  async login(data: LoginPayload): Promise<string> {
    const res = await api.post("/auth/login", data);
    const token: string = res.data.access_token;
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  },

  async signup(data: SignupPayload): Promise<void> {
    await api.post("/auth/signup", data);
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!authService.getToken();
  },
};
