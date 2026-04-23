import { NextResponse } from "next/server";

// Allow requests from local HTML files (file:// = null origin)
export function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "x-clock-secret, content-type");
  return response;
}

export function corsOptions() {
  return withCors(new NextResponse(null, { status: 204 }));
}
