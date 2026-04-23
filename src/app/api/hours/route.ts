import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { withCors, corsOptions } from "@/lib/cors";

export async function OPTIONS() { return corsOptions(); }

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("work_sessions")
    .select("id, started_at, ended_at, duration_minutes")
    .order("started_at", { ascending: false })
    .limit(50);

  if (error) return withCors(NextResponse.json({ error: error.message }, { status: 500 }));

  const totalMinutes = (data ?? [])
    .filter((s) => s.duration_minutes != null)
    .reduce((sum, s) => sum + Number(s.duration_minutes), 0);

  const activeSession = (data ?? []).find((s) => s.ended_at === null) ?? null;

  return withCors(NextResponse.json({
    total_hours: Math.round(totalMinutes / 60),
    total_minutes: Math.round(totalMinutes),
    active_session: activeSession,
    sessions: data ?? [],
  }));
}
