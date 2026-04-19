import { api } from "./api";
import type { LoginRequest, RegisterRequest, TokenResponse } from "../types/auth.types";
import type { ApiResponse, MessageResponse } from "../types/api.types";

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<TokenResponse>>("/auth/register", data).then((r) => r.data.data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<TokenResponse>>("/auth/login", data).then((r) => r.data.data),

  logout: (token: string) =>
    api.post<MessageResponse>("/auth/logout", null, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.data),

  getMe: () =>
    api.get<ApiResponse<TokenResponse["user"]>>("/auth/me").then((r) => r.data.data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<TokenResponse>>("/auth/refresh", { refresh_token: refreshToken })
      .then((r) => r.data.data),

  forgotPassword: (email: string) =>
    api.post<MessageResponse>("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, new_password: string) =>
    api.post<MessageResponse>("/auth/reset-password", { token, new_password }).then((r) => r.data),
};
