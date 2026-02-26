import { RouterProvider } from './router'
import { Providers } from './providers'

export function App() {
  return (
    <Providers>
      <RouterProvider />
    </Providers>
  )
}
