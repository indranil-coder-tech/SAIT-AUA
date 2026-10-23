import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

export const isSupabaseServerConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    serviceKey &&
    !url.includes("your-project-id") &&
    !url.includes("placeholder")
  );
};

export const getSupabaseServerClient = (): SupabaseClient | null => {
  if (!isSupabaseServerConfigured()) {
    return null;
  }
  if (!serverClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    serverClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClient;
};
