import { ProcessButton } from "@/components/process-button"

export default function ProcessPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="bg-white rounded-xl border p-8">
        <h1 className="text-2xl font-bold mb-6">Process Interview Questions</h1>
        <div className="space-y-4">
          <p>
            This page allows you to process all interview questions in the CSV file. Processing includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Formatting questions using GPT-4 to extract core concepts</li>
            <li>Generating embeddings for semantic search</li>
            <li>Storing processed results back in the CSV</li>
          </ul>
          <div className="pt-4">
            <ProcessButton />
          </div>
        </div>
      </div>
    </div>
  )
}
