import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-atz-navy text-white px-6 py-5 flex items-center justify-between flex-wrap gap-3">
      <div>
        <Link href="/" className="text-lg font-semibold tracking-wide text-white no-underline">
          ATZ Digital Academy
        </Link>
        <p className="text-atz-gold-light text-xs tracking-widest uppercase mt-0.5">
          Empowering Vision. Engineering the Future.
        </p>
      </div>
      <nav className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/student"
              className="text-sm text-white no-underline hover:text-atz-gold-light transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-xs text-atz-muted">{user.email}</span>
            <a
              href="/auth/signout"
              className="bg-atz-gold text-atz-navy px-4 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-atz-gold-dark hover:text-white transition-colors"
            >
              Sign Out
            </a>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-atz-gold text-atz-navy px-4 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-atz-gold-dark hover:text-white transition-colors"
          >
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
