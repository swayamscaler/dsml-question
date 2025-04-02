import type { Metadata } from 'next'
import { FeedbackDialog } from "@/components/feedback-dialog"
import { AuthProvider } from "@/components/auth-provider"
import { UserAuthButton } from "@/components/user-auth-button"
import './globals.css'

export const metadata: Metadata = {
  title: 'Interview Questions: by scaler community',
  description: 'Find and explore interview questions from top companies',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M8 9h8" />
                  <path d="M8 13h6" />
                  <path d="M18 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" />
                  <path d="M18 8h.01" />
                  <path d="M18 12h.01" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-2xl text-blue-900">Interview Questions: by scaler community</h1>
                <div className="flex items-center text-xs text-blue-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  <span>beta</span>
                </div>
              </div>
              <div className="ml-auto">
                <UserAuthButton />
              </div>
            </div>
          </div>
        </header>

        {children}

        <div className="fixed bottom-6 left-6 z-50">
          <div className="rounded-full shadow-lg">
            <FeedbackDialog />
          </div>
        </div>
        </AuthProvider>
      </body>
    </html>
  )
}
