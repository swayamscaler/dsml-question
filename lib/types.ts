export interface WebsiteFeedback {
  id: string
  suggestion: string
  category: "bug" | "feature" | "improvement" | "other"
  email?: string
  timestamp: number
}

export interface Comment {
  id: string
  text: string
  author: string
  timestamp: number
}

export interface Question {
  id: string
  question: string
  originalQuestion?: string
  questionUrl?: string
  answer?: string
  company: string
  role: string
  matchType: "exact" | "company" | "role"
  // Add vector or keywords for similarity comparison
  keywords?: string[]
  comments?: Comment[]
}

export interface QuestionData {
  id: string
  question: string
  originalQuestion?: string
  questionUrl?: string
  answer?: string
  company: string
  role: string
}

export interface ParsedRow {
  'Interview ID': string
  'Question (including Followups)': string
  'Solution Given'?: string
  'Company': string
  'Role': string
  [key: string]: string | undefined
}
