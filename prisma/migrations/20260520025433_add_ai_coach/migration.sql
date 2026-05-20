-- CreateEnum
CREATE TYPE "CoachIntensity" AS ENUM ('GENTLE', 'BALANCED', 'INTENSE');

-- CreateEnum
CREATE TYPE "CoachStyle" AS ENUM ('MOTIVATIONAL', 'ANALYTICAL', 'FRIENDLY', 'DRILL_SERGEANT');

-- CreateEnum
CREATE TYPE "AIQuestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'SKIPPED', 'EXPIRED');

-- CreateTable
CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "focusAreas" "Category"[],
    "challenges" TEXT,
    "dailyTimeMinutes" INTEGER NOT NULL DEFAULT 60,
    "intensity" "CoachIntensity" NOT NULL DEFAULT 'BALANCED',
    "coachStyle" "CoachStyle" NOT NULL DEFAULT 'MOTIVATIONAL',
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_quest_batches" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivation" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "daily_quest_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_quests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "category" "Category" NOT NULL,
    "status" "AIQuestStatus" NOT NULL DEFAULT 'PENDING',
    "questId" TEXT,
    "batchId" TEXT NOT NULL,

    CONSTRAINT "ai_quests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_profiles_userId_key" ON "coach_profiles"("userId");

-- CreateIndex
CREATE INDEX "daily_quest_batches_userId_idx" ON "daily_quest_batches"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_quest_batches_userId_date_key" ON "daily_quest_batches"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ai_quests_questId_key" ON "ai_quests"("questId");

-- CreateIndex
CREATE INDEX "ai_quests_batchId_idx" ON "ai_quests"("batchId");

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_quest_batches" ADD CONSTRAINT "daily_quest_batches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_quests" ADD CONSTRAINT "ai_quests_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_quests" ADD CONSTRAINT "ai_quests_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "daily_quest_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
