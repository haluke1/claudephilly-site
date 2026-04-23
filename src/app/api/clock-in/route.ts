import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-clock-secret") !== process.env.CLOCK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Close any orphaned open session first
  await supabaseAdmin
    .from("work_sessions")
    .update({ ended_at: new Date().toISOString() })
    .is("ended_at", null);

  const { data, error } = await supabaseAdmin
    .from("work_sessions")
    .insert({ started_at: new Date().toISOString() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}
