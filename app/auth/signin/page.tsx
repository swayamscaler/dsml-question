import { Metadata } from "next"
import Image from "next/image"
import { SignInButton } from "@/components/sign-in-button"

export const metadata: Metadata = {
  title: "Sign In - Interview Questions",
  description: "Sign in to access interview questions",
}

export default function SignInPage() {
  return (
    <div className="w-full min-h-[100vh] flex flex-col items-center justify-center bg-slate-50">
      <div className="max-w-[350px] w-full mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white mb-2">
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
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-600 text-sm">
              Sign in to access interview questions and continue your preparation
            </p>
          </div>
          <SignInButton />
        </div>
      </div>
    </div>
  )
}
