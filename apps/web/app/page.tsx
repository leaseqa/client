"use client";

import useSWR from "swr";

import * as client from "./client";
import HomeJourney, { HomeStat } from "./home/HomeJourney";

const DAY_MS = 86_400_000;

const statsFetcher = async (): Promise<HomeStat[]> => {
  const response = await client.fetchStats();
  if (!response?.data) {
    return [];
  }

  return [
    { label: "Open questions", value: response.data.unansweredPosts || 0 },
    { label: "Attorney replies", value: response.data.lawyerResponses || 0 },
    { label: "Recent posts", value: response.data.totalPosts || 0 },
    { label: "Notices", value: response.data.adminPosts || 0 },
  ];
};

export default function LandingPage() {
  const { data: stats = [], error, mutate } = useSWR(
    "stats/overview",
    statsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: DAY_MS,
    },
  );

  // Without this the section simply vanishes on failure, which is
  // indistinguishable from a community that has no activity yet.
  return (
    <HomeJourney
      stats={stats}
      statsError={Boolean(error)}
      onRetryStats={() => {
        void mutate();
      }}
    />
  );
}
