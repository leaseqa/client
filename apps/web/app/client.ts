import { apiGet } from "@/app/lib/api/client";

export async function fetchStats() {
  try {
    return await apiGet("/stats/overview");
  } catch ( error ) {
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
    return await apiGet("/posts");
  } catch ( error ) {
    console.error("Failed to fetch posts:", error);
    return { data: [] };
  }
}
