"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      style={{ textAlign: "center" }}
      toastOptions={{
        style: { textAlign: "center", justifyContent: "center" },
      }}
      {...props}
    />
  )
}

export { Toaster }
