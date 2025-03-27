// Compute cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return similarity;
}

// Find top k most similar vectors
export function findTopK(
  query: number[],
  vectors: { id: string; vector: number[] }[],
  k: number = 10
): { id: string; similarity: number }[] {
  const results = vectors
    .map(({ id, vector }) => ({
      id,
      similarity: cosineSimilarity(query, vector),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);

  return results;
}
