import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
