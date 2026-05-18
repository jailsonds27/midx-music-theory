import { createBrowserRouter } from "react-router-dom"
import HomePage from "@/apps/home/pages"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
])
