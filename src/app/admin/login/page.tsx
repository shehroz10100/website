import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl font-semibold text-steel">
            Nexvor<span className="text-primary"> Admin</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage the catalog
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
