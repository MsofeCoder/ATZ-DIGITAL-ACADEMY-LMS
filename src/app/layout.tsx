import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ATZ Digital Academy LMS",
  description: "Empowering Vision. Engineering the Future.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-atz-bg text-atz-navy">
        <header className="bg-atz-navy text-white px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-wide text-white no-underline">
              ATZ Digital Academy
            </Link>
            <p className="text-atz-gold-light text-xs tracking-widest uppercase mt-0.5">
              Empowering Vision. Engineering the Future.
            </p>
          </div>
          <Link
            href="/auth/signin"
            className="bg-atz-gold text-atz-navy px-4 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-atz-gold-dark hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
