const PLACEHOLDER_PATTERNS = [
  "your-project.supabase.co",
  "your-anon-key-here",
];

export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => raw.includes(pattern))) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is still the placeholder value.");
  }

  // Users often copy the REST endpoint by mistake — auth needs the project root.
  const normalized = raw
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");

  if (!normalized.endsWith(".supabase.co")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL should look like https://your-project.supabase.co",
    );
  }

  return normalized;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => key.includes(pattern))) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is still the placeholder value.");
  }

  return key;
}

export function isSupabaseConfigured(): boolean {
  try {
    getSupabaseUrl();
    getSupabaseAnonKey();
    return true;
  } catch {
    return false;
  }
}

export function getSupabaseConfigError(): string | null {
  try {
    getSupabaseUrl();
    getSupabaseAnonKey();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Supabase is not configured.";
  }
}
