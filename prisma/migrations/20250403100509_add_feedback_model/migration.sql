-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "email" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
