import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email,
  firstName,
  verificationToken
) {
  const verificationUrl = `${
    process.env.FRONTEND_URL || "http://localhost:5173"
  }/verify-email?token=${verificationToken}`;

    const verificationWindow = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${firstName}!</h2>
        <p>
          Thank you for signing up. Please verify your email address to complete
          your registration.
        </p>
        <p>Click the button below to verify your email:</p>
        <a
          href="${verificationUrl}"
          style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;"
        >
          Verify Email Address
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 32px;">
          This link will expire in 24 hours. If you didn't create an account,
          please ignore this email.
        </p>
      </div>
    `;

  try {
    console.log("Sending verification email to:", email);
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email address",
      html:  verificationWindow,
    });

    console.log("Verification email send:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}
