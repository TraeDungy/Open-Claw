import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";
export const FROM_EMAIL = process.env.FROM_EMAIL || "TSG <onboarding@resend.dev>";
export const SITE_URL = process.env.SITE_URL || "http://localhost:3000/tsg";
