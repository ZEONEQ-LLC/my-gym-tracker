"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data only changes through this app's own mutations, which write
            // the fresh snapshot into the cache — so no background refetching.
            // Trade-off: edits made on another device appear after a reload.
            staleTime: Infinity,
            gcTime: Infinity,
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
