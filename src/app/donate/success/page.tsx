import Link from "next/link";

export default function DonateSuccessPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-950">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        Thank you!
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Your donation was received. We really appreciate your support — it
        helps keep Unit Converter free for everyone.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Back to converter
      </Link>
    </div>
  );
}
