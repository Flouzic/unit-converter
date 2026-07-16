import Stripe from "stripe";

let stripeClient: Stripe | null = null;
let stripeClientKey: string | null = null;

const PLACEHOLDER_PATTERNS = [
  "your-secret-key-here",
  "your-key-here",
  "sk_test_xxx",
  "sk_live_xxx",
];

function validateSecretKey(secretKey: string): void {
  const trimmed = secretKey.trim();

  if (!trimmed.startsWith("sk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY must be your secret key (starts with sk_test_ or sk_live_), not the publishable key (pk_).",
    );
  }

  if (trimmed.startsWith("pk_")) {
    throw new Error(
      "You added the publishable key (pk_). Use the secret key (sk_test_...) from Stripe instead.",
    );
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => trimmed.includes(pattern))) {
    throw new Error(
      "STRIPE_SECRET_KEY is still the placeholder. Paste your real Stripe test key into .env.local, save the file, then restart npm run dev.",
    );
  }

  if (trimmed.length < 80) {
    throw new Error(
      "STRIPE_SECRET_KEY looks too short. Copy the full secret key from Stripe Dashboard → Developers → API keys.",
    );
  }
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is missing. Add it to .env.local, save the file, then restart npm run dev.",
    );
  }

  validateSecretKey(secretKey);

  if (!stripeClient || stripeClientKey !== secretKey) {
    stripeClient = new Stripe(secretKey);
    stripeClientKey = secretKey;
  }

  return stripeClient;
}

export function getAppUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  const origin = request.headers.get("origin");
  if (origin) return origin;

  const host = request.headers.get("host");
  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

export const DONATION_AMOUNTS_USD = [3, 5, 10, 25] as const;

export const MIN_DONATION_USD = 1;
export const MAX_DONATION_USD = 500;
