import {
  DONATION_AMOUNTS_USD,
  getAppUrl,
  getStripe,
  MAX_DONATION_USD,
  MIN_DONATION_USD,
} from "@/lib/stripe";

export const runtime = "nodejs";

interface CheckoutRequest {
  amount: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;
    const amount = Number(body.amount);

    if (!Number.isFinite(amount)) {
      return Response.json({ error: "Enter a valid donation amount." }, { status: 400 });
    }

    if (amount < MIN_DONATION_USD || amount > MAX_DONATION_USD) {
      return Response.json(
        {
          error: `Donation must be between $${MIN_DONATION_USD} and $${MAX_DONATION_USD}.`,
        },
        { status: 400 },
      );
    }

    const amountInCents = Math.round(amount * 100);
    const appUrl = getAppUrl(request);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountInCents,
            product_data: {
              name: "Unit Converter Donation",
              description: "Thank you for supporting Unit Converter.",
            },
          },
        },
      ],
      success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/donate?canceled=1`,
      metadata: {
        type: "donation",
      },
    });

    if (!session.url) {
      return Response.json({ error: "Could not start checkout." }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (error) {
    if (error instanceof Error && "type" in error) {
      const stripeError = error as Error & { type?: string };

      if (stripeError.type === "StripeAuthenticationError") {
        return Response.json(
          {
            error:
              "Stripe rejected the API key. Open .env.local, paste your sk_test_ secret key (not pk_), save the file, stop the dev server with Ctrl+C, and run npm run dev again.",
          },
          { status: 500 },
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "Checkout could not be started.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export function GET() {
  return Response.json({
    presetAmounts: DONATION_AMOUNTS_USD,
    min: MIN_DONATION_USD,
    max: MAX_DONATION_USD,
  });
}
