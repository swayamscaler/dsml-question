import { useState, useEffect } from "react"
import type { Question, Comment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, FileText, AlertCircle, ChevronDown, ChevronUp, MessageCircle } from "lucide-react"

interface QuestionResultsProps {
  results: Question[] | null
  company: string
  role: string
  isLoading: boolean
}

interface CommentFormProps {
  questionId: string
  onAddComment: (comment: Comment) => void
}

function CommentForm({ questionId, onAddComment }: CommentFormProps) {
  const [comment, setComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      text: comment,
      author: "Anonymous",
      timestamp: Date.now()
    }

    onAddComment(newComment)
    setComment("")
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your answer..."
          className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Post
        </button>
      </div>
    </form>
  )
}

export function QuestionResults({ results, company, role, isLoading }: QuestionResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});
  const [questionComments, setQuestionComments] = useState<Record<string, Comment[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<'exact' | 'company' | 'role' | null>(null);

  const groupedQuestions = {
    exact: results?.filter(q => q.matchType === "exact") ?? [],
    company: results?.filter(q => q.matchType === "company") ?? [],
    role: results?.filter(q => q.matchType === "role") ?? []
  };

  const questionsPerPage = 10;
  
  // Get current category questions
  const currentCategoryQuestions = selectedCategory
    ? groupedQuestions[selectedCategory]
    : groupedQuestions.exact;
  
  const totalQuestions = currentCategoryQuestions.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  
  const currentStartIndex = (currentPage - 1) * questionsPerPage;
  const currentEndIndex = currentPage * questionsPerPage;

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center shadow-md">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Searching for questions...</p>
        </div>
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center shadow-md">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">No questions found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We couldn't find any interview questions for {company ? `"${company}"` : "this company"}
            {role ? ` and "${role}"` : ""}. Try a different search or broaden your criteria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        {/* <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-blue-800">
            Found {results.length} unique question{results.length !== 1 ? "s" : ""}
          </h3>
          <div className="text-sm text-blue-600 font-medium px-3 py-1 bg-blue-100 rounded-full">
            {company} • {role}
          </div>
        </div> */}

        <div className="flex gap-4 flex-wrap">
            <button
                onClick={() => setSelectedCategory('exact')}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  selectedCategory === 'exact'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Exact Matches ({groupedQuestions.exact.length})
              </button>
            <button
                onClick={() => setSelectedCategory('company')}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  selectedCategory === 'company'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Other {company} Roles ({groupedQuestions.company.length})
              </button>
            <button
                onClick={() => setSelectedCategory('role')}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  selectedCategory === 'role'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Similar {role} Questions ({groupedQuestions.role.length})
              </button>
        </div>
      </div>

      <div className="space-y-8 animate-fadeIn">
        <div className="grid gap-4">
          {currentCategoryQuestions
            .slice(currentStartIndex, currentEndIndex)
            .map((question, index) => (
              <Card
                key={index}
                className={`overflow-hidden border-gray-200 transition-all hover:shadow-md ${
                  question.matchType === 'exact'
                    ? 'hover:border-blue-300'
                    : question.matchType === 'company'
                      ? 'hover:border-amber-300'
                      : 'hover:border-emerald-300'
                }`}
              >
                <CardHeader className={`pb-3 bg-gradient-to-r border-b ${
                  question.matchType === 'exact'
                    ? 'from-gray-50 to-white'
                    : question.matchType === 'company'
                      ? 'from-amber-50 to-white'
                      : 'from-emerald-50 to-white'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg text-gray-800">
                      {question.questionUrl ? (
                        <a 
                          href={question.questionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`hover:underline ${
                            question.matchType === 'exact'
                              ? 'text-blue-600 hover:text-blue-800'
                              : question.matchType === 'company'
                                ? 'text-amber-700 hover:text-amber-800'
                                : 'text-emerald-700 hover:text-emerald-800'
                          }`}
                        >
                          {question.question}
                        </a>
                      ) : (
                        <div>{question.question}</div>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {question.similarity !== undefined && (
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {Math.round(question.similarity * 100)}% match
                        </div>
                      )}
                      <Badge
                        variant={question.matchType === "exact" ? "default" : "outline"}
                        className={`${
                          question.matchType === "exact"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : question.matchType === "company"
                              ? "border-amber-500 text-amber-700 bg-amber-50"
                              : "border-emerald-500 text-emerald-700 bg-emerald-50"
                        } whitespace-nowrap`}
                      >
                        {question.matchType === "exact"
                          ? "Exact Match"
                          : question.matchType === "company"
                            ? "Company Match"
                            : "Role Match"}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-gray-600 mt-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">{question.company}</span>
                    <span className="text-gray-400">•</span>
                    <FileText className="h-4 w-4" />
                    <span>{question.role}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {question.answer && (
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedAnswers(prev => ({
                          ...prev,
                          [question.id]: !prev[question.id]
                        }))}
                        className={`w-full flex items-center justify-between text-sm font-medium hover:opacity-75 ${
                          question.matchType === 'exact'
                            ? 'text-blue-800'
                            : question.matchType === 'company'
                              ? 'text-amber-800'
                              : 'text-emerald-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4" />
                          What the candidate answered
                        </div>
                        {expandedAnswers[question.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {expandedAnswers[question.id] && (
                        <div className="mt-2">
                          <p className="text-gray-700 leading-relaxed text-sm">{question.answer}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Community Answers</h4>
                      <span className="text-xs text-gray-500">
                        {questionComments[question.id]?.length || 0} answers
                      </span>
                    </div>

                    <div className="space-y-3">
                      {questionComments[question.id]?.map((comment) => (
                        <div key={comment.id} className="text-sm bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-700">{comment.text}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            {comment.author} • {new Date(comment.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <CommentForm
                      questionId={question.id}
                      onAddComment={(comment) => {
                        setQuestionComments(prev => ({
                          ...prev,
                          [question.id]: [...(prev[question.id] || []), comment]
                        }))
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
