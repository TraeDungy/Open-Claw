import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: "Audience not configured" },
        { status: 500 }
      );
    }

    const resend = getResend();

    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "Raw Input <onboarding@resend.dev>",
      to: email,
      subject: "You're in. Welcome to Raw Input.",
      html: `
        <div style="background:#0A0A0A;color:#FFFFFF;font-family:system-ui,sans-serif;padding:40px 24px;max-width:600px;margin:0 auto;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
            <div style="width:32px;height:32px;background:#FF3D00;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#0A0A0A;font-weight:bold;font-size:12px;font-family:monospace;">RI</div>
            <span style="font-size:20px;font-weight:bold;letter-spacing:-0.5px;">RAW INPUT</span>
          </div>
          <h1 style="font-size:32px;font-weight:bold;line-height:1;margin:0 0 16px;">You're in.</h1>
          <p style="color:#B0B0B0;font-size:16px;line-height:1.6;margin:0 0 24px;">
            Welcome to the cookout. Your first <strong style="color:#FFFFFF;">console.log()</strong> newsletter drops this Sunday.
          </p>
          <p style="color:#B0B0B0;font-size:16px;line-height:1.6;margin:0 0 24px;">
            Top stories. Creator spotlights. One guaranteed laugh. And a job you should probably apply to.
          </p>
          <div style="border-top:1px solid #2A2A2A;padding-top:24px;margin-top:24px;">
            <p style="color:#FF3D00;font-family:monospace;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0;">
              // unfiltered. uncompressed. unsupervised.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
