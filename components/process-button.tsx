"use client";

import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ProcessButton() {
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function startProcessing() {
    try {
      setIsProcessing(true);
      setStatus("Starting processing...");

      const response = await fetch('/api/process');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        try {
          const updates = chunk.split('\n').filter(Boolean).map(str => JSON.parse(str));
          const latestUpdate = updates[updates.length - 1];
          if (latestUpdate.status) {
            setStatus(latestUpdate.status);
          }
        } catch (e) {
          console.error('Error parsing update:', e);
        }
      }

      setStatus("Processing completed!");
    } catch (error) {
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={startProcessing}
        className="px-6 py-4 text-base bg-blue-600 hover:bg-blue-700"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Start Processing'}
      </Button>
      {status && (
        <div className="text-sm text-gray-600">
          {status}
        </div>
      )}
    </div>
  );
}
