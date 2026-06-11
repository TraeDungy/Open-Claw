/**
 * Base email template — Signal Archaeology aesthetic
 * Table-based layout for Outlook compatibility, 600px max width
 * Inline CSS only (no external stylesheets in email)
 */

interface BaseLayoutProps {
  content: string;
  preheader?: string;
}

export function baseLayout({ content, preheader = "" }: BaseLayoutProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Telekinesis Support Group</title>
  <!--[if mso]>
  <style>table,td{font-family:Arial,Helvetica,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#F5E3B3;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Spectrum gradient line -->
          <tr>
            <td style="height:2px;background:linear-gradient(to right,#00FFB3,#FFC260,#FF8A18,#FF2A1F);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo header -->
          <tr>
            <td style="padding:28px 32px 20px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;border:1px solid rgba(255,194,96,0.4);border-radius:50%;text-align:center;vertical-align:middle;">
                    <span style="display:inline-block;width:8px;height:8px;background-color:#FFC260;border-radius:50;"></span>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.15em;color:#F5E3B3;">TELEKINESIS</p>
                    <p style="margin:0;font-size:9px;letter-spacing:0.2em;color:#FF8A18;">SUPPORT GROUP</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header image -->
          <tr>
            <td style="padding:0 32px;">
              <img src="{{headerImageUrl}}" alt="TSG" width="536" style="display:block;width:100%;max-width:536px;height:auto;border-radius:8px;" />
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background-color:rgba(255,194,96,0.1);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px 32px;">
              <p style="margin:0 0 12px 0;font-size:10px;letter-spacing:0.3em;color:rgba(245,227,179,0.3);text-transform:uppercase;">
                The Control Series&trade;
              </p>
              <p style="margin:0 0 8px 0;font-size:11px;color:rgba(245,227,179,0.4);line-height:1.6;">
                No claims. No promises. Just show up and pay attention.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(245,227,179,0.3);line-height:1.6;">
                <a href="{{unsubscribeUrl}}" style="color:rgba(245,227,179,0.4);text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="{{siteUrl}}" style="color:rgba(245,227,179,0.4);text-decoration:underline;">Visit TSG</a>
              </p>
            </td>
          </tr>

          <!-- Bottom spectrum line -->
          <tr>
            <td style="height:2px;background:linear-gradient(to right,#FF2A1F,#FF8A18,#FFC260,#00FFB3);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Replace {{variable}} placeholders with values */
export function interpolate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
