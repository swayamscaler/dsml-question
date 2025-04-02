"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect } from "react"

export default function Callback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const access_token = searchParams.get("access_token")
    const refresh_token = searchParams.get("refresh_token")

    if (access_token && refresh_token) {
      // Store tokens in cookies
      const cookieOptions = "path=/; secure; samesite=none; max-age=3600"
      document.cookie = `access_token=${access_token}; ${cookieOptions}`
      document.cookie = `refresh_token=${refresh_token}; ${cookieOptions}`
      
      // Try to get redirectUrl from cookie first (companion's approach)
      const redirectCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("redirectUrl="))
      
      let redirectUrl
      if (redirectCookie) {
        redirectUrl = decodeURIComponent(redirectCookie.split("=")[1])
        // Clear the redirect cookie
        document.cookie = "redirectUrl=; path=/; secure; samesite=none; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      } else {
        // Fall back to URL parameter
        redirectUrl = searchParams.get("redirectUrl") || "/"
      }
      router.push(redirectUrl)
    }
  }, [router, searchParams])

  return <div>Processing login...</div>
}
