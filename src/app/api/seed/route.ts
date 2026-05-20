import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/seed - Create a test user (for development only)
export async function GET() {
  try {
    // Check if test user already exists
    const existingUser = await db.user.findUnique({
      where: { email: "test@lifequest.app" },
    });

    if (existingUser) {
      return NextResponse.json({
        message: "Test user already exists",
        user: existingUser,
      });
    }

    // Create test user
    const user = await db.user.create({
      data: {
        email: "test@lifequest.app",
        name: "Test Player",
        xp: 0,
        level: 1,
      },
    });

    return NextResponse.json({
      message: "Test user created",
      user,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
