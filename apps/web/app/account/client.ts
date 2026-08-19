import { apiGet, apiPatch, apiPost, unwrapData } from "@/app/lib/api/client";

export type ActivityItem = {
  _id: string;
  type: string;
  title: string;
  summary?: string;
  href?: string;
  surface?: "account" | "notification" | "both";
  readAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export async function logout() {
  return apiPost("/auth/logout");
}

export async function updateCurrentUser(payload: { username?: string; email?: string }) {
  return apiPatch("/users/me", payload);
}

export async function fetchActivity(limit = 20): Promise<ActivityItem[]> {
  const response = await apiGet<{ data?: ActivityItem[] }>("/activity", {
    params: { limit },
  });
  return unwrapData(response) || [];
}

export async function fetchNotifications(limit = 5): Promise<ActivityItem[]> {
  const response = await apiGet<{ data?: ActivityItem[] }>("/activity/notifications", {
    params: { limit },
  });
  return unwrapData(response) || [];
}

export async function markNotificationsRead(ids: string[]) {
  const response = await apiPost<{ data?: unknown }>("/activity/notifications/read", { ids });
  return unwrapData(response);
}
