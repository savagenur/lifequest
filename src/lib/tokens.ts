import crypto from "crypto";
import { db } from "./db";

export async function generateVerificationToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  // Delete existing token for this email
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  // Delete existing token for this email
  await db.passwordResetToken.deleteMany({
    where: { email },
  });

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
}

export async function getVerificationTokenByToken(token: string) {
  try {
    return await db.verificationToken.findUnique({
      where: { token },
    });
  } catch {
    return null;
  }
}

export async function getPasswordResetTokenByToken(token: string) {
  try {
    return await db.passwordResetToken.findUnique({
      where: { token },
    });
  } catch {
    return null;
  }
}
