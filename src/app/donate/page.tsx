import { Suspense } from "react";
import DonateForm from "@/components/DonateForm";

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-6 py-12 text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <DonateForm />
    </Suspense>
  );
}
