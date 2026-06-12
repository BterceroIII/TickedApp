import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { getContext } from './providers/root-context'
import { Provider as RootProvider } from './providers/root-provider'
import { routeTree } from './routeTree.gen'

const rootProviderContext = getContext()

const router = createRouter({
  routeTree,
  context: rootProviderContext,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')

if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootProvider {...rootProviderContext}>
        <RouterProvider router={router} />
      </RootProvider>
    </StrictMode>,
  )
}
