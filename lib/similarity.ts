import type { Question } from "./types"

// Filter out similar questions from the results
export function filterSimilarQuestions(questions: Question[]): Question[] {
  if (questions.length <= 1) {
    return questions
  }

  const uniqueQuestions: Question[] = []
  const seenQuestions = new Set<string>()

  // Sort by match type priority: exact > company > role
  const sortedQuestions = [...questions].sort((a, b) => {
    const matchPriority = { exact: 0, company: 1, role: 2 }
    return matchPriority[a.matchType] - matchPriority[b.matchType]
  })

  for (const question of sortedQuestions) {
    // Skip if we've already seen this exact question
    if (seenQuestions.has(question.question)) {
      continue
    }

    // Check if this question is too similar to any we've already included
    let isTooSimilar = false
    for (const uniqueQuestion of uniqueQuestions) {
      if (areSimilar(question, uniqueQuestion)) {
        isTooSimilar = true
        break
      }
    }

    if (!isTooSimilar) {
      uniqueQuestions.push(question)
      seenQuestions.add(question.question)
    }
  }

  return uniqueQuestions
}

// Determine if two questions are similar
function areSimilar(q1: Question, q2: Question): boolean {
  // 1. Check for exact duplicates (normalized)
  const normalizedQ1 = normalizeText(q1.question)
  const normalizedQ2 = normalizeText(q2.question)

  if (normalizedQ1 === normalizedQ2) {
    return true
  }

  // 2. Check for high keyword overlap
  if (!q1.keywords || !q2.keywords) {
    return false
  }

  const similarity = calculateJaccardSimilarity(q1.keywords, q2.keywords)

  // If similarity is above threshold, consider them similar
  // Adjust threshold as needed (0.5 means 50% of keywords overlap)
  return similarity > 0.5
}

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
}

// Calculate Jaccard similarity (intersection over union)
function calculateJaccardSimilarity(set1: string[], set2: string[]): number {
  const set1Set = new Set(set1)
  const set2Set = new Set(set2)

  // Find intersection
  const intersection = new Set([...set1Set].filter((x) => set2Set.has(x)))

  // Find union
  const union = new Set([...set1Set, ...set2Set])

  // Calculate Jaccard similarity
  return intersection.size / union.size
}

