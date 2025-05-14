
"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)"
        },
        className: "group toast",
        descriptionClassName: "text-sm opacity-90",
      }}
    />
  )
}
