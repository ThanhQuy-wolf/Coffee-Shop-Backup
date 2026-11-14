import type { AuthLayoutProps } from "./AuthLayout.types";

/**
 * Auth layout template — centers content in the screen.
 * Used by login and register pages.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      {children}
    </div>
  );
}
