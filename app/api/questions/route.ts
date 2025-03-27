import Papa from 'papaparse';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ParsedRow } from '@/lib/types';
import { findTopK } from '@/lib/vector-similarity';
import { processAllQuestions, getAllQuestions } from '@/lib/questions-service';
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model: use.UniversalSentenceEncoder | null = null;

async function initializeModel() {
  if (!model) {
    model = await use.load();
  }
}

// Generate embedding for search query
async function generateEmbedding(text: string): Promise<number[]> {
  await initializeModel();
  const embeddings = await model!.embed([text]);
  const array = await embeddings.array();
  embeddings.dispose(); // Clean up tensor
  return array[0];
}

function isValidUrl(text: string | undefined): boolean {
  if (!text) return false;
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || '';
    const role = searchParams.get('role') || '';
    const query = searchParams.get('query') || '';
    const processQuestions = searchParams.get('process') === 'true';

    if (processQuestions) {
      await processAllQuestions();
    }

    const rows = await getAllQuestions();
    const filteredRows = rows.filter(row => 
      row['Interview ID'] && 
      row['Question (including Followups)'] && 
      row['Company'] && 
      row['Role']
    );

    const questions = filteredRows.map((row: ParsedRow) => ({
      id: row['Interview ID'],
      question: row['Formatted Question'] || row['Question (including Followups)'] || '',
      originalQuestion: row['Question (including Followups)'] || '',
      questionUrl: row['Question (including Followups)'] && isValidUrl(row['Question (including Followups)']) ? row['Question (including Followups)'] : undefined,
      answer: row['Solution Given'] || undefined,
      company: row['Company'] || '',
      role: row['Role'] || ''
    }));

    if (query && typeof query === 'string') {
      await initializeModel();
      const queryVector = await generateEmbedding(query);
      
      const vectors = filteredRows
        .filter(row => row['Embedding'] && row['Interview ID'])
        .map(row => ({
          id: row['Interview ID'] || '',
          vector: JSON.parse(row['Embedding'] || '[]')
        }));

      const similarQuestions = findTopK(queryVector, vectors, 50);
      const results = similarQuestions
        .map(({ id, similarity }) => {
          const question = questions.find(q => q.id === id);
          if (!question) return null;

          const companyMatch = company ? question.company.toLowerCase().includes(company.toLowerCase()) : true;
          const roleMatch = role ? question.role.toLowerCase().includes(role.toLowerCase()) : true;

          if (!companyMatch && !roleMatch) return null;

          return {
            ...question,
            matchType: companyMatch && roleMatch ? 'exact' : companyMatch ? 'company' : 'role',
            similarity
          };
        })
        .filter(Boolean);

      return NextResponse.json(results, { status: 200 });
    } else {
      const results = questions
        .map(q => ({
          ...q,
          matchType: company && role && 
            q.company.toLowerCase().includes(company.toLowerCase()) && 
            q.role.toLowerCase().includes(role.toLowerCase())
            ? 'exact'
            : company && q.company.toLowerCase().includes(company.toLowerCase())
            ? 'company'
            : 'role'
        }))
        .filter(q => {
          const companyMatch = company ? q.company.toLowerCase().includes(company.toLowerCase()) : true;
          const roleMatch = role ? q.role.toLowerCase().includes(role.toLowerCase()) : true;
          return companyMatch || roleMatch;
        });

      return NextResponse.json(results, { status: 200 });
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    return NextResponse.json([], { status: 500 });
  }
}
