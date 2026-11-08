import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ServerEventListener } from "@/app/lib/api/eventStream";
import * as client from "../client";
import { RagSession } from "../types";
import { ragKeys } from "./ragKeys";

export function useRagSessions(enabled = true) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ragKeys.sessions,
    queryFn: client.fetchSessions,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: ({
      formData,
      onEvent,
    }: {
      formData: FormData;
      onEvent?: ServerEventListener;
    }) => client.createSession(formData, onEvent),
    onSuccess: (created) => {
      queryClient.setQueryData(ragKeys.session(created._id), created);
      queryClient.setQueryData<RagSession[]>(ragKeys.sessions, (current) => {
        const rest = (current || []).filter((item) => item._id !== created._id);
        return [created, ...rest];
      });
    },
  });

  const { mutateAsync: createAsync } = createMutation;
  const createSession = useCallback(
    (formData: FormData, onEvent?: ServerEventListener) =>
      createAsync({ formData, onEvent }),
    [createAsync],
  );

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => client.deleteSession(sessionId),
    onSuccess: (_result, sessionId) => {
      queryClient.removeQueries({ queryKey: ragKeys.session(sessionId) });
      queryClient.setQueryData<RagSession[]>(ragKeys.sessions, (current) =>
        (current || []).filter((item) => item._id !== sessionId),
      );
    },
  });

  return {
    sessions: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    createSession,
    isCreating: createMutation.isPending,
    deleteSession: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
