import { prisma } from "@/lib/prisma"
import { WebsiteFeedback } from "@/lib/types"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const feedback: WebsiteFeedback = await request.json()

    const savedFeedback = await prisma.feedback.create({
      data: {
        suggestion: feedback.suggestion,
        rating: feedback.rating,
        email: feedback.email,
        timestamp: new Date(feedback.timestamp),
      },
    })

    return NextResponse.json({ success: true, feedback: savedFeedback })
  } catch (error) {
    console.error("Error saving feedback:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save feedback" },
      { status: 500 }
    )
  }
}
