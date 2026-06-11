import { baseLayout, interpolate } from "./base-layout";

const SUBJECT = "THE SIGNAL HAS BEEN RECEIVED";

const CONTENT = `
<h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;letter-spacing:0.2em;color:#FF8A18;text-transform:uppercase;">
  Welcome to the signal.
</h1>

<p style="margin:0 0 24px 0;font-size:14px;color:rgba(245,227,179,0.7);line-height:1.7;">
  You've joined a small group of observers, researchers, and experimenters tracking the space where science meets perception.
</p>

<p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.15em;color:#FFC260;text-transform:uppercase;font-weight:600;">
  Here's what you'll receive:
</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 28px 0;">
  <tr>
    <td style="padding:6px 0;font-size:13px;color:#F5E3B3;line-height:1.6;">
      <span style="color:#FFC260;margin-right:8px;">&rarr;</span>
      Archive updates &mdash; new declassified files, studies, and research
    </td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-size:13px;color:#F5E3B3;line-height:1.6;">
      <span style="color:#FFC260;margin-right:8px;">&rarr;</span>
      Tool releases &mdash; signal detection training and frequency instruments
    </td>
  </tr>
  <tr>
    <td style="padding:6px 0;font-size:13px;color:#F5E3B3;line-height:1.6;">
      <span style="color:#FFC260;margin-right:8px;">&rarr;</span>
      Session announcements &mdash; live experiments and community events
    </td>
  </tr>
</table>

<!-- CTA buttons -->
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
  <tr>
    <td style="padding-right:12px;">
      <a href="{{siteUrl}}/files" style="display:inline-block;padding:12px 24px;background-color:#FF8A18;color:#050505;font-size:12px;font-weight:700;letter-spacing:0.15em;text-decoration:none;border-radius:24px;text-transform:uppercase;">
        Enter the Archive
      </a>
    </td>
    <td>
      <a href="{{siteUrl}}/tool" style="display:inline-block;padding:12px 24px;border:1px solid rgba(245,227,179,0.3);color:#F5E3B3;font-size:12px;font-weight:600;letter-spacing:0.15em;text-decoration:none;border-radius:24px;text-transform:uppercase;">
        Train Your Perception
      </a>
    </td>
  </tr>
</table>

<!-- Film submission soft mention -->
<div style="padding:20px;border:1px solid rgba(0,255,179,0.15);border-radius:8px;background-color:rgba(0,255,179,0.03);">
  <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:0.25em;color:#00FFB3;text-transform:uppercase;font-weight:600;">
    Open Signal
  </p>
  <p style="margin:0;font-size:12px;color:rgba(245,227,179,0.6);line-height:1.6;">
    We're seeking films in sci-fi, futurism, afrofuturism, and consciousness. If you create, there's an
    <a href="{{siteUrl}}/submit" style="color:#00FFB3;text-decoration:underline;">open signal</a>.
  </p>
</div>
`;

export function welcomeEmail(vars: { siteUrl: string; headerImageUrl: string; unsubscribeUrl: string }) {
  const html = baseLayout({
    content: CONTENT,
    preheader: "You've joined the signal. Here's what comes next.",
  });
  return {
    subject: SUBJECT,
    html: interpolate(html, vars),
  };
}
