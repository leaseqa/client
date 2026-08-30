import { useQuery } from "@tanstack/react-query";

import * as client from "../client";
import { Post } from "../types";
import { qaKeys } from "./qaKeys";

export function usePosts(enabled = true) {
  const query = useQuery({
    queryKey: qaKeys.posts,
    queryFn: async () => {
      const response = await client.fetchPosts({});
      return (response.data || []) as Post[];
    },
    enabled,
    // A failed read stays failed until the user asks again. Without this, any
    // component that mounts a second observer on this key (ScenarioFilter does)
    // silently refetches, and because the page's spinner branch unmounts that
    // component, the two take turns forever: error -> render -> mount -> refetch
    // -> spinner -> unmount -> error. The Retry button is the way back.
    retryOnMount: false,
    // `networkMode` is left at the client default. Note that a query can end up
    // at status "pending" / fetchStatus "paused" when the retryer decides the
    // network is unusable — it then holds no error and no data, so callers must
    // read `isPaused` rather than assume "not loading and no error" means
    // "loaded and empty". See the page's `unreachable` handling.
  });

  return {
    posts: query.data || [],
    isLoading: query.isLoading,
    // A paused query has given up reaching the server; it is neither loading
    // nor successful, and it carries no error object.
    isPaused: query.isPaused,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
  };
}
