// middleware.ts
import { NextResponse } from "next/server";

// Bypass auth in local dev
export default function middleware() {
  if (process.env.DISABLE_AUTH === "1") {
    return NextResponse.next();
  }
  // If you want Clerk in other envs, keep the original here guarded by an else
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api/health|favicon.ico).*)"] };
