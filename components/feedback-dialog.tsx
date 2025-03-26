"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquarePlus } from "lucide-react"
import type { WebsiteFeedback } from "@/lib/types"

interface FeedbackFormProps {
  onSubmit: (feedback: WebsiteFeedback) => void
  onClose: () => void
}

function FeedbackForm({ onSubmit, onClose }: FeedbackFormProps) {
  const [suggestion, setSuggestion] = useState("")
  const [category, setCategory] = useState<WebsiteFeedback["category"]>("improvement")
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestion.trim()) return

    const feedback: WebsiteFeedback = {
      id: Math.random().toString(36).substr(2, 9),
      suggestion,
      category,
      email: email.trim() || undefined,
      timestamp: Date.now()
    }

    onSubmit(feedback)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What would you like to see improved?
        </label>
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Share your suggestions for improving the website..."
          className="w-full px-3 py-2 border rounded-md text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as WebsiteFeedback["category"])}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="improvement">Improvement</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email for follow-up"
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit Feedback
        </button>
      </div>
    </form>
  )
}

export function FeedbackDialog() {
  const [open, setOpen] = useState(false)
  
  const handleSubmit = (feedback: WebsiteFeedback) => {
    // TODO: Send feedback to backend
    console.log("Feedback submitted:", feedback)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          title="Share website feedback"
        >
          <MessageSquarePlus className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your feedback</DialogTitle>
        </DialogHeader>
        <FeedbackForm onSubmit={handleSubmit} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
