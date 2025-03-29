"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UIProvider } from "@yamada-ui/react";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>{children}</UIProvider>
    </QueryClientProvider>
  );
}
