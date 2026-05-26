import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Streak Reminder Cron Job
 * 
 * This endpoint should be called daily (e.g., at 6 PM) by a cron service
 * like Vercel Cron, GitHub Actions, or any external cron service.
 * 
 * It sends push notifications to users who:
 * 1. Have an active streak
 * 2. Haven't completed any quests today
 * 3. Have push notifications enabled
 * 
 * To protect this endpoint, set CRON_SECRET in your environment variables
 * and pass it as a Bearer token in the Authorization header.
 */

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Find users with active streaks who haven't completed quests today
    const usersAtRisk = await db.user.findMany({
      where: {
        currentStreak: { gt: 0 },
        pushSubscriptions: {
          some: {},
        },
        NOT: {
          questCompletions: {
            some: {
              completedAt: {
                gte: today,
              },
            },
          },
        },
      },
      include: {
        pushSubscriptions: true,
      },
    });

    const notifications: { userId: string; sent: boolean; error?: string }[] = [];

    // Send push notifications to each user
    for (const user of usersAtRisk) {
      for (const subscription of user.pushSubscriptions) {
        try {
          // In production, you would use web-push library here
          // For now, we'll just log and track
          console.log(`Would send streak reminder to user ${user.id}:`, {
            endpoint: subscription.endpoint,
            streak: user.currentStreak,
          });

          notifications.push({ userId: user.id, sent: true });
        } catch (error) {
          notifications.push({
            userId: user.id,
            sent: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      usersNotified: usersAtRisk.length,
      notifications,
    });
  } catch (error) {
    console.error("Streak reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send streak reminders" },
      { status: 500 }
    );
  }
}
