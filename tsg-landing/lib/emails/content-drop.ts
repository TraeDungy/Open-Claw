import { baseLayout, interpolate } from "./base-layout";

const CONTENT = `
<p style="margin:0 0 4px 0;font-size:10px;letter-spacing:0.3em;color:#FFC260;text-transform:uppercase;font-weight:600;">
  New Signal Detected
</p>

<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;letter-spacing:0.15em;color:#FF8A18;text-transform:uppercase;">
  {{title}}
</h1>

<p style="margin:0 0 24px 0;font-size:14px;color:rgba(245,227,179,0.7);line-height:1.7;">
  {{description}}
</p>

{{#items}}
<div style="padding:16px;margin-bottom:12px;border:1px solid rgba(255,194,96,0.1);border-radius:8px;background-color:rgba(255,194,96,0.03);">
  <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#F5E3B3;">{{itemTitle}}</p>
  <p style="margin:0;font-size:12px;color:rgba(245,227,179,0.5);line-height:1.5;">{{itemSummary}}</p>
</div>
{{/items}}

<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;">
  <tr>
    <td>
      <a href="{{ctaUrl}}" style="display:inline-block;padding:12px 24px;background-color:#FF8A18;color:#050505;font-size:12px;font-weight:700;letter-spacing:0.15em;text-decoration:none;border-radius:24px;text-transform:uppercase;">
        {{ctaLabel}}
      </a>
    </td>
  </tr>
</table>
`;

export function contentDropEmail(vars: {
  siteUrl: string;
  headerImageUrl: string;
  unsubscribeUrl: string;
  title: string;
  description: string;
  ctaUrl: string;
  ctaLabel: string;
}) {
  const html = baseLayout({
    content: CONTENT,
    preheader: vars.title,
  });
  return {
    subject: `NEW SIGNAL — ${vars.title}`,
    html: interpolate(html, vars),
  };
}
