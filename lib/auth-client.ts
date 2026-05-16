import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    basePath: "/api/auth",
    plugins: [inferAdditionalFields<typeof auth>()],
})