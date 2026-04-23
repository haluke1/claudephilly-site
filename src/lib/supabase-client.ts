"use client";
import { createClient } from "@supabase/supabase-js";

// Browser client — anon key, used for realtime subscriptions only
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
