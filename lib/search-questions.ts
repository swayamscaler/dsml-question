import type { Question } from "./types"
import { loadQuestions } from "./load-questions"
import { filterSimilarQuestions } from "./similarity"

export async function searchQuestions(company: string, role: string): Promise<Question[]> {
  // Load all questions from the CSV data
  const allQuestions = await loadQuestions()

  if (!company && !role) {
    return []
  }

  // Convert search terms to lowercase for case-insensitive matching
  const companyLower = company.toLowerCase()
  const roleLower = role.toLowerCase()

  let results: Question[] = []

  // Find exact matches (company + role)
  const exactMatches = allQuestions
    .filter((q) => 
      q.company.toLowerCase().includes(companyLower) && 
      q.role.toLowerCase().includes(roleLower)
    )
    .map((q) => ({
      ...q,
      matchType: "exact" as const,
      keywords: extractKeywords(q.question),
    }));

  // Find company matches (same company, different role)
  const companyMatches = allQuestions
    .filter((q) => 
      q.company.toLowerCase().includes(companyLower) && 
      !q.role.toLowerCase().includes(roleLower)
    )
    .map((q) => ({
      ...q,
      matchType: "company" as const,
      keywords: extractKeywords(q.question),
    }));

  // Find role matches (more flexible role matching)
  const roleMatches = allQuestions
    .filter((q) => {
      // Don't include questions already matched by company
      if (q.company.toLowerCase().includes(companyLower)) {
        return false;
      }

      // Split the search role and question role into words
      const searchRoleWords = roleLower.split(/[\s-_]+/);
      const questionRoleWords = q.role.toLowerCase().split(/[\s-_]+/);

      // Check if any word in the search role matches any word in the question role
      return searchRoleWords.some(word => 
        word.length > 2 && // Only consider words longer than 2 characters
        questionRoleWords.some(qWord => qWord.includes(word))
      );
    })
    .map((q) => ({
      ...q,
      matchType: "role" as const,
      keywords: extractKeywords(q.question),
    }));

  // Combine all matches, with each group filtered for similarity
  results = [
    ...filterSimilarQuestions(exactMatches),
    ...filterSimilarQuestions(companyMatches),
    ...filterSimilarQuestions(roleMatches)
  ];

  return results;
}

// Extract keywords from a question for similarity comparison
function extractKeywords(text: string): string[] {
  // Convert to lowercase
  const lowerText = text.toLowerCase()

  // Remove punctuation and split into words
  const words = lowerText.replace(/[^\w\s]/g, "").split(/\s+/)

  // Remove common stop words
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "is",
    "are",
    "was",
    "were",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "as",
    "of",
    "how",
    "what",
    "when",
    "where",
    "why",
    "who",
    "which",
    "would",
    "could",
    "should",
    "do",
    "does",
    "did",
    "have",
    "has",
    "had",
    "can",
    "will",
  ])

  return words.filter((word) => !stopWords.has(word) && word.length > 2)
}
