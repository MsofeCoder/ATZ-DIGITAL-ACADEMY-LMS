import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  // Log all incoming cookies before anything runs
  const incomingCookieHeader = request.headers.get("cookie") ?? "";
  const incomingNames = incomingCookieHeader
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean);
  console.log("[signout] incoming cookies:", incomingNames);

  const supabase = await createClient();

  // signOut() calls setAll() internally (via onAuthStateChange → applyServerStorage)
  // to clear cookies on the cookies() internal buffer. This does NOT affect
  // NextResponse.redirect() which creates a separate response object.
  const { error } = await supabase.auth.signOut();
  console.log("[signout] signOut() error:", error ?? "none");

  // Build the redirect response
  const response = NextResponse.redirect(`${origin}/`);

  // Explicitly clear ALL sb-* cookies on the redirect response.
  // We read from the original request headers (immutable) to get the exact names.
  for (const part of incomingCookieHeader.split(";")) {
    const name = part.trim().split("=")[0];
    if (name.startsWith("sb-")) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  }

  // Log what's on the redirect response before returning
  const outgoingCookies = response.headers.getSetCookie?.() ?? [];
  console.log("[signout] outgoing Set-Cookie headers:", outgoingCookies);

  return response;
}
