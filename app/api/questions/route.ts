import { readFile } from 'fs/promises';
import { join } from 'path';
import Papa from 'papaparse';
import { NextResponse } from 'next/server';
import type { QuestionData, ParsedRow } from '@/lib/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function formatQuestionWithAI(question: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
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

function isValidUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const csvPath = join(process.cwd(), 'dsml.csv');
    const csvText = await readFile(csvPath, 'utf-8');

    return new Promise(async (resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<ParsedRow>) => {
          const filteredRows = results.data
            .filter(row => row['Interview ID'] && row['Question (including Followups)'] && row['Company'] && row['Role']);

          const questions = await Promise.all(
            filteredRows.map(async (row: ParsedRow) => {
              const questionText = row['Question (including Followups)'];
              const isUrl = isValidUrl(questionText);
              const formattedQuestion = !isUrl && !questionText.startsWith('http') 
                ? await formatQuestionWithAI(questionText)
                : questionText;
              
              return {
                id: row['Interview ID'],
                question: formattedQuestion,
                questionUrl: isValidUrl(questionText) ? questionText : undefined,
                answer: row['Solution Given'] || undefined,
                company: row['Company'],
                role: row['Role']
              };
            })
          );
          
          resolve(NextResponse.json(questions));
        },
        error: (error: Error) => {
          console.error("Error parsing CSV:", error);
          resolve(NextResponse.json([], { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error("Error loading questions:", error);
    return NextResponse.json([], { status: 500 });
  }
}
