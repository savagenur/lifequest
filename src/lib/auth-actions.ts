"use server";

import bcrypt from "bcryptjs";
import { db } from "./db";
import { generateVerificationToken, generatePasswordResetToken, getVerificationTokenByToken, getPasswordResetTokenByToken } from "./tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "./mail";
import { signIn, signOut } from "./auth";
import { AuthError } from "next-auth";

export async function logout() {
  await signOut({ redirectTo: "/auth/signin" });
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  const { name, email, password } = data;

  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email already in use" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Generate verification token and send email
  try {
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);
    return { success: "Verification email sent! Check your inbox." };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: "Account created! Email verification may be delayed." };
  }
}

export async function login(data: { email: string; password: string }) {
  const { email, password } = data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: "Logged in successfully!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          if (error.message.includes("EmailNotVerified")) {
            return { error: "Please verify your email first" };
          }
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function verifyEmail(token: string) {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await db.user.findFirst({
    where: { email: existingToken.identifier },
  });

  if (!existingUser) {
    return { error: "Email not found" };
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
    },
  });

  await db.verificationToken.delete({
    where: { token },
  });

  return { success: "Email verified! You can now sign in." };
}

export async function forgotPassword(email: string) {
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    // Don't reveal if email exists
    return { success: "If an account exists, a reset email has been sent." };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(email, passwordResetToken.token);

  return { success: "If an account exists, a reset email has been sent." };
}

export async function resetPassword(token: string, password: string) {
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email },
  });

  if (!existingUser) {
    return { error: "Email not found" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated! You can now sign in." };
}

export async function resendVerificationEmail(email: string) {
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return { error: "Email not found" };
  }

  if (existingUser.emailVerified) {
    return { error: "Email already verified" };
  }

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(email, verificationToken.token);

  return { success: "Verification email sent!" };
}
