import { NextRequest, NextResponse } from "next/server";
import { resend, AUDIENCE_ID, FROM_EMAIL, SITE_URL } from "@/lib/resend";
import { welcomeEmail } from "@/lib/emails/welcome";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, source } = body as { email?: string; source?: string };

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    // Add contact to Resend Audience
    if (AUDIENCE_ID) {
      try {
        await resend.contacts.create({
          audienceId: AUDIENCE_ID,
          email,
          firstName: source || "website",
          unsubscribed: false,
        });
      } catch (err: unknown) {
        // Contact may already exist — not a blocking error
        const message = err instanceof Error ? err.message : String(err);
        if (!message.includes("already exists")) {
          console.error("Resend contact error:", message);
        }
      }
    }

    // Send welcome email
    const headerImageUrl = `${SITE_URL}/assets/email-header.png`;
    const unsubscribeUrl = `${SITE_URL}#unsubscribe`;

    const { subject, html } = welcomeEmail({
      siteUrl: SITE_URL,
      headerImageUrl,
      unsubscribeUrl,
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject,
      html,
    });

    // Notify admin of new signup
    const adminEmail = process.env.ADMIN_EMAIL || "trae.dungy@gmail.com";
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [adminEmail],
      subject: `NEW SIGNAL — ${email}`,
      html: `<div style="font-family:monospace;background:#050505;color:#F5E3B3;padding:24px;">
        <p style="color:#00FFB3;font-size:10px;letter-spacing:0.3em;">NEW SUBSCRIBER</p>
        <p style="font-size:16px;margin:8px 0;"><strong>${email}</strong></p>
        <p style="color:#FFC260;font-size:11px;">Source: ${source || "website"}</p>
        <p style="color:rgba(245,227,179,0.3);font-size:10px;margin-top:12px;">${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
      </div>`,
    }).catch(() => {}); // Non-blocking — don't fail signup if admin email fails

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, cadence } = body as { email?: string; cadence?: string };

    if (!email || !AUDIENCE_ID) {
      return NextResponse.json({ error: "Missing email." }, { status: 400 });
    }

    // Update contact with cadence preference stored in lastName field
    await resend.contacts.update({
      audienceId: AUDIENCE_ID,
      id: email,
      lastName: cadence || "weekly",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cadence update error:", err);
    // Non-critical — don't fail the user experience
    return NextResponse.json({ ok: true });
  }
}
