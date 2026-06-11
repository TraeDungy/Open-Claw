const API_KEY = () => process.env.RESEND_API_KEY;
const AUDIENCE_ID = () => process.env.RESEND_AUDIENCE_ID;
const FROM = () => process.env.FROM_EMAIL || "TSG <onboarding@resend.dev>";

export async function listContacts() {
  const res = await fetch(
    `https://api.resend.com/audiences/${AUDIENCE_ID()}/contacts`,
    { headers: { Authorization: `Bearer ${API_KEY()}` } }
  );
  if (!res.ok) throw new Error(`Resend list error: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export async function sendEmail(to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM(),
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend send error ${res.status}: ${err}`);
  }
  return res.json();
}
