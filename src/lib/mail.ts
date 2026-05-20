import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@lifequest.app",
    to: email,
    subject: "Verify your email - LifeQuest",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to LifeQuest!</h1>
        <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
        <a href="${confirmLink}" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't create an account, you can ignore this email.
        </p>
        <p style="color: #666; font-size: 12px;">
          Or copy and paste this link: ${confirmLink}
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${domain}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@lifequest.app",
    to: email,
    subject: "Reset your password - LifeQuest",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetLink}" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can ignore this email.
        </p>
        <p style="color: #666; font-size: 12px;">
          Or copy and paste this link: ${resetLink}
        </p>
      </div>
    `,
  });
}
