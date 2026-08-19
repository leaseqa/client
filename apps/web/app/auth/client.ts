import { apiGet, apiPost } from "@/app/lib/api/client";

export async function fetchSession() {
  return apiGet("/auth/session");
}

export async function login(credentials: { email: string; password: string }) {
  return apiPost("/auth/login", credentials);
}

export async function register(data: {
  email: string;
  password: string;
  username?: string;
  role?: string;
}) {
  return apiPost("/auth/register", data);
}
