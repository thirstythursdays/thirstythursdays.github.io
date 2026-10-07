// Contact-form Worker: verifies the Turnstile token, then emails the message via Resend.
// Doing both in one request means a bot can't skip the CAPTCHA and hit the mailer directly.
//
// Secrets (wrangler secret put): TURNSTILE_SECRET_KEY, RESEND_API_KEY, TO_EMAIL
// Vars (wrangler.jsonc):         FROM_EMAIL, ALLOWED_ORIGINS (comma-separated)

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  TO_EMAIL: string;
  FROM_EMAIL: string;
  ALLOWED_ORIGINS: string;
}

const CATEGORIES = [
  'General',
  'Organization Partnership',
  'DJ / Performer',
  'Sponsorship / Business Partnership',
];

const LIMITS = { name: 100, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    if (!allowedOrigins(env).includes(origin)) {
      return new Response('Forbidden', { status: 403 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json({ success: false, error: 'Method not allowed.' }, 405, origin);
    }

    let data: Record<string, unknown>;
    try {
      data = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid request.' }, 400, origin);
    }

    // Honeypot: real visitors never see or fill this field. Pretend success to bots.
    if (typeof data.website === 'string' && data.website.trim() !== '') {
      return json({ success: true }, 200, origin);
    }

    const name = typeof data.name === 'string' ? oneLine(data.name) : '';
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const message = typeof data.message === 'string' ? data.message.trim() : '';
    const category = typeof data.category === 'string' ? data.category : '';
    const token = typeof data.token === 'string' ? data.token : '';

    if (
      !name || name.length > LIMITS.name ||
      !EMAIL_RE.test(email) || email.length > LIMITS.email ||
      !message || message.length > LIMITS.message ||
      !CATEGORIES.includes(category)
    ) {
      return json({ success: false, error: 'Please check the form and try again.' }, 400, origin);
    }
    if (!token) {
      return json({ success: false, error: 'Please complete the verification.' }, 400, origin);
    }

    // 1. Turnstile siteverify (server-side only).
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') ?? undefined,
      }),
    });
    const outcome = (await verify.json()) as { success: boolean; hostname?: string };
    const originHost = new URL(origin).hostname;
    if (!outcome.success || (outcome.hostname && outcome.hostname !== originHost)) {
      return json({ success: false, error: 'Verification failed. Please try again.' }, 403, origin);
    }

    // 2. Send the email.
    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: [env.TO_EMAIL],
        reply_to: email,
        subject: `[${category}] Message from ${name}`,
        text: `${message}\n\n—\n${name} <${email}>\nCategory: ${category}\nSent from the Thirsty Thursdays website`,
      }),
    });
    if (!send.ok) {
      console.error('Resend error', send.status, await send.text());
      return json({ success: false, error: 'We couldn’t send your message. Please try again later.' }, 502, origin);
    }

    return json({ success: true }, 200, origin);
  },
};
