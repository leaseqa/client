"use client";

import { ReactNode, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";

import store from "@/app/store";
import SessionLoader from "@/app/auth/SessionLoader";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            // The API is a separate origin that can be down while the browser
            // is perfectly online, so failures must surface as errors. Under
            // the default "online" mode the retryer instead PAUSES — the query
            // sits at status "pending" / fetchStatus "paused" with no error,
            // which reads to a route as "not loading, no error, no data" and
            // renders an empty state. Telling a renter there are no questions
            // when the server is unreachable is a different and wrong claim.
            networkMode: "always",
          },
        },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionLoader>
          {children}
        </SessionLoader>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
