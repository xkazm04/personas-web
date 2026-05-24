import "server-only";

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export function getRequiredEnv(name: string): string {
  const value = getOptionalEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function hasSupabaseEnv(): boolean {
  return !!(
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL") &&
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
