import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ytapi-hub-api",
    timestamp: new Date().toISOString(),
  });
}
