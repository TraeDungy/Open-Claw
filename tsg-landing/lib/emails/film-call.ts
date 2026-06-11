import { baseLayout, interpolate } from "./base-layout";

const SUBJECT = "OPEN SIGNAL — A Call for Films";

const CONTENT = `
<p style="margin:0 0 4px 0;font-size:10px;letter-spacing:0.3em;color:#00FFB3;text-transform:uppercase;font-weight:600;">
  Open Signal
</p>

<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;letter-spacing:0.15em;color:#FF8A18;text-transform:uppercase;">
  A Call for Films
</h1>

<p style="margin:0 0 24px 0;font-size:14px;color:rgba(245,227,179,0.7);line-height:1.7;">
  We're building something at the intersection of cinema and consciousness. If you've made a film that explores the edges of perception, we want to see it.
</p>

<div style="padding:20px;border:1px solid rgba(0,255,179,0.15);border-radius:8px;background-color:rgba(0,255,179,0.03);margin-bottom:24px;">
  <p style="margin:0 0 12px 0;font-size:12px;letter-spacing:0.15em;color:#FFC260;text-transform:uppercase;font-weight:600;">
    Genres We're Seeking
  </p>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding:4px 0;font-size:13px;color:#F5E3B3;">
        <span style="color:#00FFB3;margin-right:8px;">&rarr;</span> Sci-Fi &amp; Speculative Fiction
      </td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-size:13px;color:#F5E3B3;">
        <span style="color:#00FFB3;margin-right:8px;">&rarr;</span> Futurism &amp; Afrofuturism
      </td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-size:13px;color:#F5E3B3;">
        <span style="color:#00FFB3;margin-right:8px;">&rarr;</span> Consciousness &amp; Perception
      </td>
    </tr>
    <tr>
      <td style="padding:4px 0;font-size:13px;color:#F5E3B3;">
        <span style="color:#00FFB3;margin-right:8px;">&rarr;</span> Experimental &amp; Avant-Garde
      </td>
    </tr>
  </table>
</div>

<p style="margin:0 0 24px 0;font-size:14px;color:rgba(245,227,179,0.7);line-height:1.7;">
  Shorts and features welcome. No entry fee. We review everything. If your work resonates with the frequency, we'll be in touch about screening, distribution, and community.
</p>

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
  <tr>
    <td>
      <a href="{{siteUrl}}/submit" style="display:inline-block;padding:14px 28px;background-color:#00FFB3;color:#050505;font-size:12px;font-weight:700;letter-spacing:0.15em;text-decoration:none;border-radius:24px;text-transform:uppercase;">
        Submit Your Film
      </a>
    </td>
  </tr>
</table>

<p style="margin:0;font-size:12px;color:rgba(245,227,179,0.4);line-height:1.6;font-style:italic;">
  "The signal doesn't care about your budget. It cares about your attention."
</p>
`;

export function filmCallEmail(vars: { siteUrl: string; headerImageUrl: string; unsubscribeUrl: string }) {
  const html = baseLayout({
    content: CONTENT,
    preheader: "We're seeking films in sci-fi, futurism, and consciousness.",
  });
  return {
    subject: SUBJECT,
    html: interpolate(html, vars),
  };
}
