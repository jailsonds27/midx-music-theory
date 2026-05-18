import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { router } from "@/routes/route"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NuqsAdapter>
          <RouterProvider router={router} />
        </NuqsAdapter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
