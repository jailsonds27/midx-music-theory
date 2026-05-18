import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { router } from "@/routes/route"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <NuqsAdapter>
        <RouterProvider router={router} />
      </NuqsAdapter>
    </ThemeProvider>
  </StrictMode>
)
