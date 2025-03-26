import type { QuestionData } from "./types";

export async function loadQuestions(): Promise<QuestionData[]> {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading questions:", error);
    return [];
  }
}
