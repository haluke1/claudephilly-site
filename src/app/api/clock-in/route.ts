import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { withCors, corsOptions } from "@/lib/cors";

export async function OPTIONS() { return corsOptions(); }

export async function POST(req: NextRequest) {
  if (req.headers.get("x-clock-secret") !== process.env.CLOCK_SECRET) {
    return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  await supabaseAdmin
    .from("work_sessions")
    .update({ ended_at: new Date().toISOString() })
    .is("ended_at", null);

  const { data, error } = await supabaseAdmin
    .from("work_sessions")
    .insert({ started_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return withCors(NextResponse.json({ error: error.message }, { status: 500 }));
  return withCors(NextResponse.json({ session: data }));
}
