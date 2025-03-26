import { SearchForm } from "@/components/search-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="max-w-6xl mx-auto pt-12 p-6 md:p-8">
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Find Real Interview Questions</h2>
          <p className="text-gray-600">
            Access our database of real interview questions from top companies. Search by company, role, or both
            to prepare for your next interview.
          </p>
        </div>

        <SearchForm />
      </main>

      <footer className="mt-20 border-t py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Wishing you a day filled with kindness and inspiration.</p>
        </div>
      </footer>
    </div>
  )
}
