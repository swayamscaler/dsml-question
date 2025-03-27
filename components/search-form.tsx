"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QuestionResults } from "@/components/question-results"
import { searchQuestions } from "@/lib/search-questions"
import type { Question } from "@/lib/types"
import { Search, Briefcase } from "lucide-react"

export function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [results, setResults] = useState<Question[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedCompany = company.trim()
    const trimmedRole = role.trim()
    const trimmedQuery = searchQuery.trim()
    
    if (!trimmedCompany || !trimmedRole) return

    setIsSearching(true)
    setSearchPerformed(true)

    try {
      const searchResults = await searchQuestions(trimmedCompany, trimmedRole, trimmedQuery || undefined)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching questions:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border shadow-md p-6 md:p-8 transition-all hover:shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-700 font-medium">
              Search Query (Optional)
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <Input
                id="search"
                placeholder="Search for specific topics or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-gray-700 font-medium">
                Company
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <Input
                  id="company"
                  placeholder="Enter company name (e.g., Google)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700 font-medium">
                Role
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
                    <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
                    <path d="M3 15h6" />
                    <path d="M3 18h6" />
                  </svg>
                </div>
                <Input
                  id="role"
                  placeholder="Enter role (e.g., Software Engineer)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              className="px-8 py-6 text-base bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
              disabled={isSearching}
            >
              <Search className="h-5 w-5" />
              {isSearching ? "Searching..." : "Find Interview Questions"}
            </Button>
          </div>
        </form>
      </div>

      {searchPerformed && <QuestionResults results={results} company={company} role={role} isLoading={isSearching} />}
    </div>
  )
}
