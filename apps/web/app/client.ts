import axios from "axios";

const axiosWithCredentials = axios.create({ withCredentials: true });
const HOST = (process.env.NEXT_PUBLIC_HTTP_SERVER || "").replace(/\/$/, "");
export const API_BASE = HOST ? `${HOST}/api` : "/api";

export async function fetchStats() {
  try {
    const response = await axiosWithCredentials.get(
      `${API_BASE}/stats/overview`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      data: {
        adminPosts: 0,
        unansweredPosts: 0,
        lawyerResponses: 0,
        totalPosts: 0,
        breakdown: [],
      },
    };
  }
}

export async function fetchPosts() {
  try {
    const response = await axiosWithCredentials.get(`${API_BASE}/posts`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return { data: [] };
  }
}
