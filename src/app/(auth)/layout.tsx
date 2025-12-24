"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-80 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 size-80 animate-pulse rounded-full bg-primary/15 blur-3xl delay-1000" />
        <div className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/5 blur-3xl delay-500" />
        
        {/* Floating dots pattern */}
        <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" className="fill-primary/30" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
            W
          </div>
          <span className="text-xl font-semibold text-foreground">Webhooker</span>
        </Link>

        {/* Auth toggle tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 p-1 backdrop-blur-sm">
          <Link
            href="/sign-in"
            className={`relative rounded-full px-6 py-2 text-sm font-medium transition-all ${
              isSignIn
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isSignIn && (
              <motion.div
                layoutId="auth-tab"
                className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/25"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Sign In</span>
          </Link>
          <Link
            href="/sign-up"
            className={`relative rounded-full px-6 py-2 text-sm font-medium transition-all ${
              !isSignIn
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {!isSignIn && (
              <motion.div
                layoutId="auth-tab"
                className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/25"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Sign Up</span>
          </Link>
        </div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
