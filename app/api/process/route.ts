import { processAllQuestions } from '@/lib/questions-service';

// Set up a custom encoder for streaming JSON responses
const encoder = new TextEncoder();

export async function GET() {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start processing in the background
  processAllQuestions({
    onProgress: async (status: string) => {
      // Write progress updates to the stream
      await writer.write(
        encoder.encode(JSON.stringify({ status }) + '\n')
      );
    }
  }).catch(async (error) => {
    // Write error to stream
    await writer.write(
      encoder.encode(
        JSON.stringify({
          status: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }) + '\n'
      )
    );
  }).finally(async () => {
    await writer.close();
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
    },
  });
}
