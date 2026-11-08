import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ServerEventListener } from "@/app/lib/api/eventStream";
import * as client from "../client";
import { ChatMessage, RagSession } from "../types";
import { ragKeys } from "./ragKeys";

type SendVariables = {
  sessionId: string | null;
  message: string;
  onEvent?: ServerEventListener;
};

function optimisticUserMessage(content: string): ChatMessage {
  return {
    role: "user",
    content,
    citations: [],
    createdAt: new Date().toISOString(),
  };
}

export function useRagConversation(sessionId: string | null) {
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: ({ sessionId: targetId, message, onEvent }: SendVariables) => {
      if ( !targetId ) {
        return Promise.reject(new Error("Create a chat source first."));
      }
      return client.sendMessage(targetId, message, onEvent);
    },
    onMutate: async ({ sessionId: targetId, message }) => {
      if ( !targetId ) {
        return { previous: undefined };
      }
      await queryClient.cancelQueries({ queryKey: ragKeys.session(targetId) });
      const previous = queryClient.getQueryData<RagSession>(ragKeys.session(targetId));
      if ( previous ) {
        queryClient.setQueryData<RagSession>(ragKeys.session(targetId), {
          ...previous,
          messages: [...previous.messages, optimisticUserMessage(message)],
        });
      }
      return { previous };
    },
    onError: (_error, { sessionId: targetId }, context) => {
      if ( targetId && context?.previous ) {
        queryClient.setQueryData(ragKeys.session(targetId), context.previous);
      }
    },
    onSuccess: (result) => {
      // Filed under the session the server answered for, not whichever review
      // is open by the time a streamed answer finishes.
      queryClient.setQueryData(ragKeys.session(result.session._id), result.session);
      queryClient.setQueryData<RagSession[]>(ragKeys.sessions, (current) => {
        const rest = (current || []).filter((item) => item._id !== result.session._id);
        return [result.session, ...rest];
      });
    },
  });

  const { mutateAsync } = sendMutation;
  const sendAsync = useCallback(
    (message: string, onEvent?: ServerEventListener) =>
      mutateAsync({ sessionId, message, onEvent }),
    [mutateAsync, sessionId],
  );

  return {
    sendAsync,
    isSending: sendMutation.isPending,
    error: sendMutation.error,
  };
}
