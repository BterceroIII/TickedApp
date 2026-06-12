import { QueryClient } from "@tanstack/react-query"

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  return {
    queryClient,
  }
}

export type RootProviderContext = ReturnType<typeof getContext>
