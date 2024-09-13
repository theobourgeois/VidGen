"use client";
/* eslint-disable */
import {
  PaymentElement,
  LinkAuthenticationElement,
  Elements,
} from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { env } from "~/env";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Separator } from "@radix-ui/react-select";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useSearchParams } from "next/navigation";
import {
  getPackDescription,
  getPackPrice,
  getPackTitle,
  type Pack,
  PackFeatures,
} from "../_components/pack-content";

export default function Page() {
  const [options, setOptions] = useState<StripeElementsOptions>({});
  const [stripePromise] = useState(
    loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  );
  const pack = useSearchParams().get("pack") as Pack;

  useEffect(() => {
    const clientSecret = localStorage.getItem("clientSecret");
    if (clientSecret) {
      setOptions({
        clientSecret,
      });
    }
  }, []);

  if (options.clientSecret === undefined) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentPage pack={pack}>
        <CheckoutForm />
      </PaymentPage>
    </Elements>
  );
}

function PaymentPage({
  children,
  pack,
}: {
  pack: Pack;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/pricing"
          className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-red-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pricing
        </Link>
        <h1 className="mb-6 text-3xl font-bold">Complete Your Purchase</h1>
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{getPackTitle(pack)}</CardTitle>
              <CardDescription>{getPackDescription(pack)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  ${getPackPrice(pack)}
                </span>
                <span className="text-sm text-gray-500">One-time purchase</span>
              </div>
              <Separator />
              <ul className="space-y-2">
                <PackFeatures pack="creator" />
              </ul>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Tokens will be added to your account immediately after purchase
              </p>
            </CardFooter>
          </Card>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>{children}</CardContent>
              <CardFooter className="flex flex-col items-stretch">
                <p className="mt-4 text-center text-sm text-gray-500">
                  <ShieldCheck className="mr-1 inline-block h-4 w-4" />
                  Secure payment powered by Stripe
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h2 className="mb-4 text-xl font-semibold">
            Why Choose Vid<span className="text-red-600">Gen</span>?
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Easy to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Create videos in minutes, no experience required
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">High Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Generate stunning 9:16 videos perfect for social media
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flexible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Use your tokens anytime, they never expire
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pack = useSearchParams().get("pack") as Pack;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    // add pack to the return urlj
    const returnUrl = `${window.location.origin}/completion?pack=${pack}`;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: returnUrl,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage((error as any).message);
    } else {
      setMessage("An unexpected error occured.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <LinkAuthenticationElement
        id="link-authentication-element"
        // Access the email value like so:
        // onChange={(event) => {
        //  setEmail(event.value.email);
        // }}
        //
        // Prefill the email field like so:
        // options={{defaultValues: {email: 'foo@bar.com'}}}
      />
      <PaymentElement id="payment-element" />

      <Button
        type="submit"
        className="mt-2 w-full bg-red-600 py-6 text-lg text-white hover:bg-red-700"
        disabled={isLoading || !stripe || !elements}
      >
        {isLoading ? "Processing..." : `Pay ${"$" + getPackPrice(pack)}`}
      </Button>
      {message && (
        <p className="mt-4 text-center text-sm text-red-600">{message}</p>
      )}
    </form>
  );
}
