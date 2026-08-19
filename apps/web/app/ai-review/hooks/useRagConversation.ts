import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as client from "../client";
import { ChatMessage, RagSession } from "../types";
import { ragKeys } from "./ragKeys";

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
    mutationFn: (message: string) => {
      if ( !sessionId ) {
        return Promise.reject(new Error("Create a chat source first."));
      }
      return client.sendMessage(sessionId, message);
    },
    onMutate: async (message) => {
      if ( !sessionId ) {
        return { previous: undefined };
      }
      await queryClient.cancelQueries({ queryKey: ragKeys.session(sessionId) });
      const previous = queryClient.getQueryData<RagSession>(ragKeys.session(sessionId));
      if ( previous ) {
        queryClient.setQueryData<RagSession>(ragKeys.session(sessionId), {
          ...previous,
          messages: [...previous.messages, optimisticUserMessage(message)],
        });
      }
      return { previous };
    },
    onError: (_error, _message, context) => {
      if ( sessionId && context?.previous ) {
        queryClient.setQueryData(ragKeys.session(sessionId), context.previous);
      }
    },
    onSuccess: (result) => {
      if ( !sessionId ) {
        return;
      }
      queryClient.setQueryData(ragKeys.session(sessionId), result.session);
      queryClient.setQueryData<RagSession[]>(ragKeys.sessions, (current) => {
        const rest = (current || []).filter((item) => item._id !== result.session._id);
        return [result.session, ...rest];
      });
    },
  });

  return {
    send: sendMutation.mutate,
    sendAsync: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    error: sendMutation.error,
  };
}
