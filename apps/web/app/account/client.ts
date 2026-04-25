import axios from "axios";

const axiosWithCredentials = axios.create({withCredentials: true});
const HOST = (process.env.NEXT_PUBLIC_HTTP_SERVER || "").replace(/\/$/, "");
export const API_BASE = HOST ? `${HOST}/api` : "/api";

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
  const response = await axiosWithCredentials.post(`${API_BASE}/auth/logout`);
  return response.data;
}

export async function updateCurrentUser(payload: { username?: string; email?: string }) {
  const response = await axiosWithCredentials.patch(`${API_BASE}/users/me`, payload);
  return response.data;
}

export async function fetchActivity(limit = 20): Promise<ActivityItem[]> {
  const response = await axiosWithCredentials.get(`${API_BASE}/activity`, {
    params: {limit},
  });
  return response.data.data || [];
}

export async function fetchNotifications(limit = 5): Promise<ActivityItem[]> {
  const response = await axiosWithCredentials.get(`${API_BASE}/activity/notifications`, {
    params: {limit},
  });
  return response.data.data || [];
}

export async function markNotificationsRead(ids: string[]) {
  const response = await axiosWithCredentials.post(`${API_BASE}/activity/notifications/read`, {ids});
  return response.data.data;
}
