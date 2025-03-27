import Papa from 'papaparse';
import OpenAI from 'openai';
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { createClient } from '@supabase/supabase-js';
import type { ParsedRow } from './types';

// Initialize Clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize TensorFlow backend
tf.setBackend('tensorflow');

let model: use.UniversalSentenceEncoder | null = null;

// Initialize USE model
async function initializeModel() {
  if (!model) {
    try {
      model = await use.load();
    } catch (error) {
      console.error("Error loading Universal Sentence Encoder model:", error);
      throw error;
    }
  }
}

// Format question using GPT-4
async function formatQuestionWithAI(question: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an assistant that identifies the fundamental concepts in interview questions. Extract the core question being asked, removing any unnecessary context or verbosity. Your response should still be in question format. Do not use any markdown formatting in your response. Keep your response simple, direct, and focused on what's being tested."
        },
        {
          role: "user",
          content: `Analyze this interview question and return only its core concept as a clear, direct question without any markdown: "${question}"`
        }
      ]
    });

    return completion.choices[0].message.content || question;
  } catch (error) {
    console.error("Error formatting question with OpenAI:", error);
    return question;
  }
}

// Generate embedding for a question
async function generateEmbedding(text: string): Promise<number[]> {
  await initializeModel();
  const embeddings = await model!.embed([text]);
  const array = await embeddings.array();
  embeddings.dispose(); // Clean up tensor
  return array[0];
}

// Process a single question: format and generate embedding
async function processQuestion(
  question: string, 
  existingFormattedQuestion?: string
): Promise<{
  formattedQuestion: string;
  embedding: number[];
}> {
  // If we already have a formatted question, skip the API call
  const formattedQuestion = existingFormattedQuestion || await formatQuestionWithAI(question);
  const embedding = await generateEmbedding(formattedQuestion);
  return { formattedQuestion, embedding };
}

// Read CSV file from Supabase storage
export async function getAllQuestions(): Promise<ParsedRow[]> {
  const { data, error } = await supabase
    .storage
    .from('questions')
    .download('dsml.csv');

  if (error) {
    console.error('Error fetching CSV from Supabase:', error);
    throw error;
  }

  const csvText = await data.text();
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as ParsedRow[]),
    });
  });
}

// Write CSV file to Supabase storage
async function writeCsv(rows: ParsedRow[]): Promise<void> {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  
  const { error } = await supabase
    .storage
    .from('questions')
    .upload('dsml.csv', blob, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error writing CSV to Supabase:', error);
    throw error;
  }
}

// Process all questions in the CSV
export async function processAllQuestions({ 
  onProgress 
}: { 
  onProgress?: (status: string) => Promise<void> 
} = {}) {
  const rows = await getAllQuestions();
  const processedRows: ParsedRow[] = [];

  const totalQuestions = rows.length;
  const batchSize = 5; // Process 5 questions at a time to avoid rate limits
  
  if (onProgress) {
    await onProgress(`Found ${totalQuestions} questions to process`);
  }
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(rows.length / batchSize);
    
    if (onProgress) {
      await onProgress(`Processing batch ${batchNumber}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, rows.length)} of ${totalQuestions} questions)`);
    }
    const processedBatch = await Promise.all(
      batch.map(async (row) => {
        // Skip if already processed and has embedding
        if (row['Formatted Question'] && row['Embedding']) {
          if (onProgress) {
            await onProgress(`Skipping already processed question with ID ${row['Interview ID']} (has formatted question and embedding)`);
          }
          return row;
        }

        const question = row['Question (including Followups)'];
        if (!question) return row;

        // Skip URLs
        if (question.startsWith('http')) {
          return {
            ...row,
            'Formatted Question': question,
            'Embedding': '[]' // Empty embedding for URLs
          };
        }

        try {
          // Pass existing formatted question if available
          const { formattedQuestion, embedding } = await processQuestion(
            question,
            row['Formatted Question'] // Will be undefined if not present
          );
          
          if (row['Formatted Question'] && onProgress) {
            await onProgress(`Generating new embedding using existing formatted question for ID ${row['Interview ID']}`);
          } else if (onProgress) {
            await onProgress(`Formatting and generating embedding for ID ${row['Interview ID']}`);
          }
          return {
            ...row,
            'Formatted Question': formattedQuestion,
            'Embedding': JSON.stringify(Array.from(embedding))
          };
        } catch (error) {
          console.error(`Error processing question ${row['Interview ID']}:`, error);
          return row;
        }
      })
    );

    processedRows.push(...processedBatch);
    
    // Save progress after each batch
    await writeCsv([...processedRows, ...rows.slice(i + batchSize)]);
    
    if (onProgress) {
      const processed = processedRows.length;
      const remaining = totalQuestions - processed;
      await onProgress(`Progress: ${processed}/${totalQuestions} questions processed (${remaining} remaining)`);
    }
    
    // Add a small delay between batches to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (onProgress) {
    await onProgress("All questions processed successfully!");
  }
  return processedRows;
}

// Get embeddings from CSV
export async function getStoredEmbeddings(): Promise<Map<string, number[]>> {
  const rows = await getAllQuestions();
  const embeddings = new Map<string, number[]>();

  for (const row of rows) {
    if (row['Embedding']) {
      try {
        embeddings.set(row['Interview ID'], JSON.parse(row['Embedding']));
      } catch (error) {
        console.error(`Error parsing embedding for question ${row['Interview ID']}:`, error);
      }
    }
  }

  return embeddings;
}
