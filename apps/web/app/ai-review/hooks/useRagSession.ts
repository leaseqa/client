import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/app/lib/api/client";
import * as client from "../client";
import { RAG_SESSION_POLL_MS, ragKeys } from "./ragKeys";

export function useRagSession(sessionId: string | null) {
  const query = useQuery({
    queryKey: ragKeys.session(sessionId || ""),
    queryFn: async ({ signal }) => {
      try {
        return await client.fetchSessionById(sessionId as string, signal);
      } catch ( error ) {
        if ( isApiError(error) && error.code === "ABORTED" ) {
          throw new DOMException("Aborted", "AbortError");
        }
        throw error;
      }
    },
    enabled: Boolean(sessionId),
    refetchInterval: (queryState) =>
      queryState.state.data?.status === "indexing" ? RAG_SESSION_POLL_MS : false,
  });

  return {
    session: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
