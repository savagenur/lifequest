import Groq from "groq-sdk";
import type { Category, Difficulty, CoachIntensity, CoachStyle } from "@/generated/prisma/client";

// Initialize Groq client
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Set to true to use mock data instead of Groq (for development/testing)
const USE_MOCK = !process.env.GROQ_API_KEY || process.env.USE_MOCK_AI === "true";

interface UserContext {
  name: string | null;
  level: number;
  xp: number;
  focusAreas: Category[];
  challenges: string | null;
  dailyTimeMinutes: number;
  intensity: CoachIntensity;
  coachStyle: CoachStyle;
  recentCompletions: {
    title: string;
    category: Category;
    completedAt: Date;
  }[];
  activeQuests: {
    title: string;
    category: Category;
  }[];
  questsByCategory: Record<Category, number>;
}

interface GeneratedQuest {
  title: string;
  description: string;
  reason: string;
  xpReward: number;
  difficulty: Difficulty;
  category: Category;
}

interface DailyQuestsResponse {
  motivation: string;
  quests: GeneratedQuest[];
}

const COACH_PERSONALITIES: Record<CoachStyle, string> = {
  MOTIVATIONAL: "You are an enthusiastic, positive coach who believes in the user's potential. Use encouraging language like 'You've got this!', 'Let's crush it today!', 'I believe in you!'",
  ANALYTICAL: "You are a data-driven coach who provides logical reasoning. Use phrases like 'Based on your patterns...', 'The data suggests...', 'Optimizing for your goals...'",
  FRIENDLY: "You are a warm, supportive friend who genuinely cares. Use casual language like 'Hey!', 'How about we try...', 'No pressure, but...'",
  DRILL_SERGEANT: "You are a tough but fair coach who pushes limits. Use direct language like 'No excuses.', 'Push through.', 'You're stronger than you think.'",
};

const INTENSITY_CONFIG: Record<CoachIntensity, { questCount: number; difficultyBias: string }> = {
  GENTLE: { questCount: 3, difficultyBias: "Focus on EASY quests with occasional MEDIUM. Prioritize building habits over intensity." },
  BALANCED: { questCount: 4, difficultyBias: "Mix of difficulties: 1-2 EASY, 1-2 MEDIUM, 0-1 HARD. Balance challenge with achievability." },
  INTENSE: { questCount: 5, difficultyBias: "Push the user: 1 EASY, 2 MEDIUM, 1-2 HARD, occasional EPIC. They want to be challenged." },
};

const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  EPIC: 100,
};

// Mock quest templates for development/testing
function generateMockQuests(context: UserContext): DailyQuestsResponse {
  const intensityConfig = INTENSITY_CONFIG[context.intensity];
  const questCount = intensityConfig.questCount;
  
  const mockQuestsByCategory: Record<Category, GeneratedQuest[]> = {
    HEALTH: [
      { title: "Take a 20-minute walk", description: "Get outside and walk around your neighborhood. Fresh air and movement will boost your mood.", reason: "Physical activity reduces anxiety and improves mental clarity.", xpReward: 10, difficulty: "EASY", category: "HEALTH" },
      { title: "Do 10 push-ups", description: "Start with 10 push-ups. If that's too easy, try 20!", reason: "Building physical strength builds mental confidence.", xpReward: 10, difficulty: "EASY", category: "HEALTH" },
      { title: "Drink 8 glasses of water", description: "Stay hydrated throughout the day. Set reminders if needed.", reason: "Proper hydration improves focus and energy levels.", xpReward: 10, difficulty: "EASY", category: "HEALTH" },
      { title: "30-minute workout session", description: "Complete a full workout - cardio, strength, or yoga.", reason: "Regular exercise is the foundation of physical and mental health.", xpReward: 25, difficulty: "MEDIUM", category: "HEALTH" },
    ],
    LEARNING: [
      { title: "Read for 15 minutes", description: "Read a book, article, or educational content for at least 15 minutes.", reason: "Daily reading expands your knowledge and vocabulary.", xpReward: 10, difficulty: "EASY", category: "LEARNING" },
      { title: "Learn 5 new words", description: "Learn 5 new vocabulary words in any language you're studying.", reason: "Expanding vocabulary improves communication skills.", xpReward: 10, difficulty: "EASY", category: "LEARNING" },
      { title: "Watch an educational video", description: "Watch a TED talk, documentary, or tutorial on a topic you want to learn.", reason: "Visual learning helps reinforce new concepts.", xpReward: 10, difficulty: "EASY", category: "LEARNING" },
      { title: "Complete a coding challenge", description: "Solve one programming problem on LeetCode, HackerRank, or similar.", reason: "Problem-solving skills transfer to all areas of life.", xpReward: 25, difficulty: "MEDIUM", category: "LEARNING" },
    ],
    CAREER: [
      { title: "Update your LinkedIn profile", description: "Add recent achievements or update your skills section.", reason: "A strong online presence opens career opportunities.", xpReward: 10, difficulty: "EASY", category: "CAREER" },
      { title: "Network with one person", description: "Reach out to a colleague or connection. Send a message or schedule a coffee chat.", reason: "Networking is key to career growth and opportunities.", xpReward: 25, difficulty: "MEDIUM", category: "CAREER" },
      { title: "Learn a new tool for work", description: "Spend 30 minutes learning a tool that could improve your productivity.", reason: "New skills make you more valuable and efficient.", xpReward: 25, difficulty: "MEDIUM", category: "CAREER" },
    ],
    PERSONAL: [
      { title: "Practice gratitude", description: "Write down 3 things you're grateful for today.", reason: "Gratitude practice improves mental well-being and perspective.", xpReward: 10, difficulty: "EASY", category: "PERSONAL" },
      { title: "Reach out to a friend", description: "Send a message or call someone you haven't talked to in a while.", reason: "Maintaining relationships is essential for happiness.", xpReward: 10, difficulty: "EASY", category: "PERSONAL" },
      { title: "Try something new", description: "Do one thing outside your comfort zone today, even if small.", reason: "Growth happens when we push our boundaries.", xpReward: 25, difficulty: "MEDIUM", category: "PERSONAL" },
      { title: "Meditate for 10 minutes", description: "Find a quiet spot and practice mindfulness meditation.", reason: "Meditation reduces anxiety and improves focus.", xpReward: 10, difficulty: "EASY", category: "PERSONAL" },
    ],
    FINANCE: [
      { title: "Track your spending", description: "Log all your expenses for today in a spreadsheet or app.", reason: "Awareness of spending is the first step to financial health.", xpReward: 10, difficulty: "EASY", category: "FINANCE" },
      { title: "Review your subscriptions", description: "Check all your recurring subscriptions and cancel any you don't use.", reason: "Eliminating waste frees up money for what matters.", xpReward: 25, difficulty: "MEDIUM", category: "FINANCE" },
      { title: "Read about investing", description: "Spend 20 minutes learning about investing basics.", reason: "Financial literacy is essential for long-term wealth.", xpReward: 10, difficulty: "EASY", category: "FINANCE" },
    ],
  };

  const motivationMessages: Record<CoachStyle, string[]> = {
    MOTIVATIONAL: [
      `Good morning, ${context.name || "champion"}! Today is YOUR day to shine. Let's crush these quests! 💪`,
      `Rise and grind, ${context.name || "warrior"}! Every quest completed is a step toward the best version of you!`,
      `You've got this, ${context.name || "hero"}! Remember: small steps lead to big changes. Let's go! 🚀`,
    ],
    ANALYTICAL: [
      `Based on your progress, ${context.name || "user"}, I've optimized today's quests for maximum growth in your focus areas.`,
      `Data shows consistency is key. Complete these ${questCount} quests to maintain your momentum, ${context.name || "user"}.`,
      `Your completion rate suggests you're ready for these challenges. Let's analyze your performance today.`,
    ],
    FRIENDLY: [
      `Hey ${context.name || "friend"}! I picked some fun quests for you today. No pressure - just do your best! 😊`,
      `Good morning! I hope you slept well. Here are some gentle challenges to make today awesome!`,
      `Hi there! Ready for a great day? I've got some cool quests that I think you'll enjoy!`,
    ],
    DRILL_SERGEANT: [
      `Listen up, ${context.name || "recruit"}! No excuses today. These quests aren't going to complete themselves.`,
      `Time to work. ${questCount} quests. Zero complaints. Get it done.`,
      `You said you wanted results. Here's how you get them. Now move!`,
    ],
  };

  // Select quests from focus areas
  const selectedQuests: GeneratedQuest[] = [];
  const focusAreas = context.focusAreas.length > 0 ? context.focusAreas : (["PERSONAL", "HEALTH"] as Category[]);
  
  for (let i = 0; i < questCount; i++) {
    const category = focusAreas[i % focusAreas.length];
    const categoryQuests = mockQuestsByCategory[category];
    const quest = categoryQuests[Math.floor(Math.random() * categoryQuests.length)];
    
    // Avoid duplicates
    if (!selectedQuests.find(q => q.title === quest.title)) {
      selectedQuests.push(quest);
    } else {
      // Try another quest from same category
      const otherQuest = categoryQuests.find(q => !selectedQuests.find(sq => sq.title === q.title));
      if (otherQuest) selectedQuests.push(otherQuest);
    }
  }

  const motivations = motivationMessages[context.coachStyle];
  const motivation = motivations[Math.floor(Math.random() * motivations.length)];

  return {
    motivation,
    quests: selectedQuests.slice(0, questCount),
  };
}

export async function generateDailyQuests(context: UserContext): Promise<DailyQuestsResponse> {
  if (!groq) {
    throw new Error("AI service not configured. Please add GROQ_API_KEY to your environment variables.");
  }

  try {
    return await generateWithGroq(context);
  } catch (error) {
    console.error("Groq error:", error);
    
    // Check if it's a quota/rate limit error
    if (error instanceof Error && (
      error.message.includes("quota") ||
      error.message.includes("rate limit") ||
      error.message.includes("429") ||
      error.message.includes("insufficient credits")
    )) {
      throw new Error("You've reached your AI quota. Please upgrade your subscription to continue generating personalized quests.");
    }
    
    // Check if it's a network error
    if (error instanceof Error && (
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("timeout")
    )) {
      throw new Error("No internet connection. AI quests require an active internet connection.");
    }
    
    throw new Error("Failed to generate AI quests. Please try again later.");
  }
}

async function generateWithGroq(context: UserContext): Promise<DailyQuestsResponse> {
  if (!groq) throw new Error("Groq not configured");
  
  const intensityConfig = INTENSITY_CONFIG[context.intensity];
  const personality = COACH_PERSONALITIES[context.coachStyle];

  const systemPrompt = `You are an AI life coach for a gamified self-improvement app called LifeQuest.

${personality}

Your job is to generate personalized daily quests (tasks) that help the user improve their life.

RULES:
1. Generate exactly ${intensityConfig.questCount} quests
2. ${intensityConfig.difficultyBias}
3. Quests should be specific, actionable, and completable in one day
4. Each quest needs a clear "reason" explaining why it helps the user
5. Distribute quests across the user's focus areas: ${context.focusAreas.join(", ")}
6. Consider their available time: ${context.dailyTimeMinutes} minutes per day
7. Don't repeat quests they've recently completed
8. Build on their progress - they're level ${context.level}

CATEGORIES (use these exact values):
- HEALTH: Exercise, diet, sleep, mental health
- LEARNING: Reading, courses, skills, education
- CAREER: Work tasks, networking, professional growth
- PERSONAL: Hobbies, relationships, self-care
- FINANCE: Budgeting, saving, financial literacy

DIFFICULTIES (use these exact values):
- EASY: Quick wins, 5-15 minutes, builds momentum
- MEDIUM: Moderate effort, 15-30 minutes, meaningful progress
- HARD: Significant effort, 30-60 minutes, real challenge
- EPIC: Major undertaking, 60+ minutes, transformative

Respond ONLY with valid JSON in this exact format:
{
  "motivation": "A personalized morning motivation message (2-3 sentences)",
  "quests": [
    {
      "title": "Short, action-oriented title",
      "description": "Clear instructions on how to complete this quest",
      "reason": "Why this quest matters for the user's growth",
      "xpReward": number (10 for EASY, 25 for MEDIUM, 50 for HARD, 100 for EPIC),
      "difficulty": "EASY" | "MEDIUM" | "HARD" | "EPIC",
      "category": "HEALTH" | "LEARNING" | "CAREER" | "PERSONAL" | "FINANCE"
    }
  ]
}`;

  const userPrompt = `Generate today's quests for this user:

USER PROFILE:
- Name: ${context.name || "Adventurer"}
- Level: ${context.level}
- Total XP: ${context.xp}
- Focus Areas: ${context.focusAreas.join(", ")}
- Challenges: ${context.challenges || "Not specified"}
- Daily Time Available: ${context.dailyTimeMinutes} minutes

RECENT COMPLETIONS (don't repeat these):
${context.recentCompletions.length > 0 
  ? context.recentCompletions.map(q => `- ${q.title} (${q.category})`).join("\n")
  : "- No recent completions"}

CURRENT ACTIVE QUESTS (don't duplicate):
${context.activeQuests.length > 0
  ? context.activeQuests.map(q => `- ${q.title} (${q.category})`).join("\n")
  : "- No active quests"}

PROGRESS BY CATEGORY:
${Object.entries(context.questsByCategory).map(([cat, count]) => `- ${cat}: ${count} completed`).join("\n")}

Generate ${intensityConfig.questCount} personalized quests for today.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content) as DailyQuestsResponse;

  // Validate and fix XP rewards
  parsed.quests = parsed.quests.map(quest => ({
    ...quest,
    xpReward: XP_BY_DIFFICULTY[quest.difficulty] || 10,
  }));

  return parsed;
}
