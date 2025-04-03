"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MessageSquarePlus } from "lucide-react"
import type { WebsiteFeedback } from "@/lib/types"
import { toast } from "sonner"

interface FeedbackFormProps {
  onSubmit: (feedback: WebsiteFeedback) => void
  onClose: () => void
}

function FeedbackForm({ onSubmit, onClose }: FeedbackFormProps) {
  const [suggestion, setSuggestion] = useState("")
  const [rating, setRating] = useState(3)
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestion.trim() || !email.trim()) return

    const feedback: WebsiteFeedback = {
      id: Math.random().toString(36).substr(2, 9),
      suggestion,
      rating,
      email: email.trim(),
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
          How useful did you find this feature? (1-5)
        </label>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${rating === value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
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
  
  const handleSubmit = async (feedback: WebsiteFeedback) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit feedback')
      }
      toast.success('Thank you for your feedback!')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback. Please try again.')
    }
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
