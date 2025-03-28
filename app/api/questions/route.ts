import { readFile } from 'fs/promises';
import { join } from 'path';
import Papa from 'papaparse';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ParsedRow } from '@/lib/types';
import { findTopK } from '@/lib/vector-similarity';
import { processAllQuestions, getStoredEmbeddings } from '@/lib/questions-service';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embedding for search query
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float"
  });
  
  return response.data[0].embedding;
}

function isValidUrl(text: string): boolean {
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

    // If processing is requested, run it first
    if (processQuestions) {
      await processAllQuestions();
    }

    const csvPath = join(process.cwd(), 'dsml.csv');
    const csvText = await readFile(csvPath, 'utf-8');

    const response = await new Promise<Response>((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<ParsedRow>) => {
          const filteredRows = results.data
            .filter(row => row['Interview ID'] && row['Question (including Followups)'] && row['Company'] && row['Role']);

          const questions = filteredRows.map((row: ParsedRow) => ({
            id: row['Interview ID'],
            question: row['Formatted Question'] || row['Question (including Followups)'],
            originalQuestion: row['Question (including Followups)'],
            questionUrl: isValidUrl(row['Question (including Followups)']) ? row['Question (including Followups)'] : undefined,
            answer: row['Solution Given'] || undefined,
            company: row['Company'],
            role: row['Role']
          }));

          // Use vector search if query is provided
          if (query) {
            (async () => {
              try {
                const queryVector = await generateEmbedding(query);
                
                // Get stored embeddings from CSV
                const storedEmbeddings = new Map<string, number[]>();
                for (const row of filteredRows) {
                  if (row['Embedding']) {
                    try {
                      storedEmbeddings.set(row['Interview ID'], JSON.parse(row['Embedding']));
                    } catch (error) {
                      console.error(`Error parsing embedding for question ${row['Interview ID']}:`, error);
                    }
                  }
                }

                // Convert stored embeddings to format needed by findTopK
                const vectors = Array.from(storedEmbeddings.entries()).map(([id, vector]) => ({
                  id,
                  vector
                }));

                const similarQuestions = findTopK(queryVector, vectors, 50);

                // Filter and sort results
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

                resolve(NextResponse.json(results, { status: 200 }));
              } catch (error) {
                reject(error);
              }
            })();
          } else {
            // Traditional company/role filtering without vector search
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

            resolve(NextResponse.json(results, { status: 200 }));
          }
        },
        error: (error: Error) => {
          console.error("Error parsing CSV:", error);
          reject(new Error("Failed to parse CSV"));
        }
      });
    });
    return response;
  } catch (error) {
    console.error("Error loading questions:", error);
    return NextResponse.json([], { status: 500 });
  }
}
