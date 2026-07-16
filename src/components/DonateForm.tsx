"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DONATION_AMOUNTS_USD, MAX_DONATION_USD, MIN_DONATION_USD } from "@/lib/stripe";

export default function DonateForm() {
  const searchParams = useSearchParams();
  const wasCanceled = searchParams.get("canceled") === "1";

  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAmount = useCustom
    ? Number.parseFloat(customAmount)
    : selectedAmount;

  async function startCheckout() {
    setError(null);

    if (!Number.isFinite(activeAmount)) {
      setError("Enter a valid amount.");
      return;
    }

    if (activeAmount < MIN_DONATION_USD || activeAmount > MAX_DONATION_USD) {
      setError(`Choose an amount between $${MIN_DONATION_USD} and $${MAX_DONATION_USD}.`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: activeAmount }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Checkout failed.");
      }

      window.location.href = data.url as string;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not start checkout.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          Support the project
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Make a donation
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Unit Converter is free to use. If it helps you in the kitchen or at
          work, consider buying us a coffee. Payments are handled securely by
          Stripe.
        </p>
      </div>

      {wasCanceled ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          Checkout was canceled. You can try again whenever you like.
        </p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Choose an amount
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DONATION_AMOUNTS_USD.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setUseCustom(false);
                setSelectedAmount(amount);
              }}
              className={[
                "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                !useCustom && selectedAmount === amount
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
              ].join(" ")}
            >
              ${amount}
            </button>
          ))}
        </div>

        <label className="mt-5 flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Custom amount (USD)
          </span>
          <input
            type="number"
            min={MIN_DONATION_USD}
            max={MAX_DONATION_USD}
            step="0.01"
            inputMode="decimal"
            placeholder={`${MIN_DONATION_USD} – ${MAX_DONATION_USD}`}
            value={customAmount}
            onChange={(event) => {
              setUseCustom(true);
              setCustomAmount(event.target.value);
            }}
            onFocus={() => setUseCustom(true)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={() => void startCheckout()}
          disabled={isLoading}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading
            ? "Redirecting to Stripe…"
            : `Donate $${Number.isFinite(activeAmount) ? activeAmount.toFixed(2).replace(/\.00$/, "") : "—"}`}
        </button>

        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          You&apos;ll be redirected to Stripe&apos;s secure checkout page.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Back to converter
        </Link>
      </p>
    </div>
  );
}
