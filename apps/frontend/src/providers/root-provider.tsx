import { QueryClientProvider } from "@tanstack/react-query"

import type { RootProviderContext } from "./root-context"

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
} & RootProviderContext) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
