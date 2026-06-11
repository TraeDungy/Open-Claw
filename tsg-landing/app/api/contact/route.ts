import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL, SITE_URL } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, filmTitle, genre, runtime, link, synopsis, statement } = body as {
      name?: string;
      email?: string;
      filmTitle?: string;
      genre?: string;
      runtime?: string;
      link?: string;
      synopsis?: string;
      statement?: string;
    };

    if (!name || !email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Name and valid email required." }, { status: 400 });
    }

    // Send notification to admin
    const adminHtml = `
      <h2 style="color:#FF8A18;">New Film Submission</h2>
      <table style="font-family:monospace;font-size:13px;color:#F5E3B3;background:#050505;padding:16px;border-radius:8px;">
        <tr><td style="color:#FFC260;padding:4px 12px 4px 0;">Name</td><td>${name}</td></tr>
        <tr><td style="color:#FFC260;padding:4px 12px 4px 0;">Email</td><td>${email}</td></tr>
        ${filmTitle ? `<tr><td style="color:#FFC260;padding:4px 12px 4px 0;">Film</td><td>${filmTitle}</td></tr>` : ""}
        ${genre ? `<tr><td style="color:#FFC260;padding:4px 12px 4px 0;">Genre</td><td>${genre}</td></tr>` : ""}
        ${runtime ? `<tr><td style="color:#FFC260;padding:4px 12px 4px 0;">Runtime</td><td>${runtime}</td></tr>` : ""}
        ${link ? `<tr><td style="color:#FFC260;padding:4px 12px 4px 0;">Link</td><td><a href="${link}" style="color:#00FFB3;">${link}</a></td></tr>` : ""}
      </table>
      ${synopsis ? `<h3 style="color:#FFC260;margin-top:16px;">Synopsis</h3><p style="color:#F5E3B3;">${synopsis}</p>` : ""}
      ${statement ? `<h3 style="color:#FFC260;margin-top:16px;">Director Statement</h3><p style="color:#F5E3B3;">${statement}</p>` : ""}
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [FROM_EMAIL.match(/<(.+)>/)?.[1] || "onboarding@resend.dev"],
      replyTo: email,
      subject: `OPEN SIGNAL — ${filmTitle || "New Submission"} from ${name}`,
      html: adminHtml,
    });

    // Send confirmation to submitter
    const confirmHtml = `
      <div style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;background:#050505;color:#F5E3B3;padding:32px;max-width:600px;">
        <div style="height:2px;background:linear-gradient(to right,#00FFB3,#FFC260,#FF8A18);margin-bottom:24px;"></div>
        <p style="font-size:10px;letter-spacing:0.3em;color:#00FFB3;text-transform:uppercase;margin:0 0 8px 0;">Open Signal</p>
        <h1 style="font-size:20px;letter-spacing:0.15em;color:#FF8A18;margin:0 0 16px 0;">YOUR SIGNAL HAS BEEN RECEIVED</h1>
        <p style="font-size:14px;color:rgba(245,227,179,0.7);line-height:1.7;margin:0 0 16px 0;">
          Thank you for submitting${filmTitle ? ` "${filmTitle}"` : ""}. We review every submission and will be in touch if your work resonates with the frequency.
        </p>
        <p style="font-size:12px;color:rgba(245,227,179,0.4);line-height:1.6;margin:0;">
          No claims. No promises. Just signal.
        </p>
        <div style="height:1px;background:rgba(255,194,96,0.1);margin:24px 0;"></div>
        <p style="font-size:10px;letter-spacing:0.2em;color:rgba(245,227,179,0.3);">TELEKINESIS SUPPORT GROUP &mdash; THE CONTROL SERIES&trade;</p>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Your signal has been received — TSG",
      html: confirmHtml,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
