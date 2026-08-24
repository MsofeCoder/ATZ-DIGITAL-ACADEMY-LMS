import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(`${origin}/`);

  // signOut() clears cookies via the Supabase cookie interface, but
  // Next.js 16.x doesn't merge those mutations into NextResponse.redirect().
  // Delete all sb-* auth cookies on the redirect response explicitly.
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const name = part.trim().split("=")[0];
    if (name.startsWith("sb-")) {
      response.cookies.set(name, "", { maxAge: 0, path: "/" });
    }
  }

  return response;
}
