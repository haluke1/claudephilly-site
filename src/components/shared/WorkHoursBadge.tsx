"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

type Session = {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
};

type HoursData = {
  total_hours: number;
  total_minutes: number;
  active_session: Session | null;
  sessions: Session[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDuration(minutes: number | null, startedAt?: string) {
  if (minutes == null) {
    // Active session — compute live
    if (!startedAt) return "ongoing";
    const mins = Math.round((Date.now() - new Date(startedAt).getTime()) / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function WorkHoursBadge() {
  const [data, setData] = useState<HoursData | null>(null);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetch("/api/hours")
      .then((r) => r.json())
      .then(setData);
  }, []);

  // Realtime — refresh on any insert/update to work_sessions
  useEffect(() => {
    const channel = supabase
      .channel("work_sessions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_sessions" },
        () => {
          fetch("/api/hours").then((r) => r.json()).then(setData);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Tick every minute to update active session duration live
  useEffect(() => {
    if (!data?.active_session) return;
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [data?.active_session]);

  if (!data) return null;

  const isActive = data.active_session !== null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded session log */}
      {open && (
        <div className="glass rounded-2xl p-5 w-72 max-h-80 overflow-y-auto">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-3 font-heading">
            Work Sessions
          </p>
          {data.sessions.length === 0 && (
            <p className="text-text-muted text-sm">No sessions yet.</p>
          )}
          <div className="flex flex-col gap-2">
            {data.sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-text-muted">{formatDate(s.started_at)}</span>
                <span className={s.ended_at ? "text-white" : "text-accent"}>
                  {s.ended_at
                    ? formatDuration(s.duration_minutes)
                    : `● ${formatDuration(null, s.started_at)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2.5 glass rounded-full text-sm font-heading font-semibold transition-all hover:bg-white/10 cursor-pointer"
      >
        {isActive && (
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        )}
        <span className="text-accent">{data.total_hours}h</span>
        <span className="text-text-muted font-normal">built</span>
      </button>
    </div>
  );
}
