import type { Question } from "./types"

export async function searchQuestions(company: string, role: string, query?: string): Promise<Question[]> {
  try {
    const searchParams = new URLSearchParams({
      company,
      role,
      ...(query ? { query } : {})
    });
    
    const response = await fetch(`/api/questions?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching questions:", error);
    return [];
  }
}
