import { processAllQuestions } from '@/lib/questions-service';
import { NextResponse } from 'next/server';

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start processing in the background
  processAllQuestions({
    onProgress: async (status: string) => {
      // Send each update as a JSON line
      await writer.write(
        encoder.encode(JSON.stringify({ status }) + '\n')
      );
    }
  }).then(async () => {
    // Close the stream when done
    await writer.close();
  }).catch(async (error) => {
    // Send error and close stream
    await writer.write(
      encoder.encode(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        }) + '\n'
      )
    );
    await writer.close();
  });

  // Return the stream immediately
  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
