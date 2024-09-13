import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Zap, Clock, CheckCircle, ArrowRight, FrownIcon } from "lucide-react";
import {
  getPackTitle,
  getPackTokenCount,
  getPackVideoMinutes,
  Pack,
} from "../_components/pack-content";
import { db } from "~/server/db";
import { payments } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { api } from "~/trpc/server";
import { revalidatePath } from "next/cache";
import { getServerAuthSession } from "~/server/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    pack: Pack;
    redirect_status: string;
    payment_intent: string;
  };
}) {
  const session = await getServerAuthSession();
  if (!session) {
    return renderErrorPage();
  }
  const pack = searchParams.pack;

  if (searchParams.redirect_status !== "succeeded" || !pack) {
    return renderErrorPage();
  }

  let totalTokens = 0;

  try {
    // Check if payment was already processed
    const previousPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentIntent, searchParams.payment_intent));

    if (previousPayment.length === 0) {
      // Add tokens to the account
      await api.payment.addTokensToAccount({
        tokens: getPackTokenCount(pack),
        paymentIntent: searchParams.payment_intent,
      });
      console.log("Added tokens to account");
      revalidatePath("/");
    }

    // Fetch the updated token count
    totalTokens = await api.user.getUserTokens();
  } catch (error) {
    console.error("Error adding tokens to account", error);
    return renderErrorPage();
  }

  return renderSuccessPage(pack, totalTokens);
}

function renderErrorPage() {
  return (
    <main className="m-8 flex flex-col items-center justify-center">
      <div className="mb-4 flex flex-col items-center">
        <FrownIcon className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="mb-2 text-3xl font-bold">Oops! Something went wrong</h1>
      <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
        We couldn't process your purchase at this time.
      </p>
    </main>
  );
}

function renderSuccessPage(pack: Pack, totalTokens: number) {
  const addedTokens = getPackTokenCount(pack);

  return (
    <main className="flex-1 px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-3xl font-bold">Purchase Successful!</h1>
        <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
          Your {getPackTitle(pack)} has been added to your account.
        </p>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Token Summary</CardTitle>
            <CardDescription>
              Here's what's been added to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg">Tokens Added:</span>
              <span className="text-2xl font-bold text-red-600">
                {addedTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg">Video Minutes:</span>
              <span className="text-2xl font-bold">
                ~{getPackVideoMinutes(pack).toLocaleString()} minutes
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg">Total Tokens:</span>
                <span className="text-2xl font-bold">
                  {totalTokens.toLocaleString()}
                </span>
              </div>
              <Progress
                value={(addedTokens / totalTokens) * 100}
                className="h-2"
              />
              <p className="text-sm text-gray-500">
                <Zap className="mr-1 inline-block h-4 w-4" />
                {addedTokens.toLocaleString()} new tokens added to your existing
                balance
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              <Clock className="mr-1 inline-block h-4 w-4" />
              Your tokens never expire. Use them anytime!
            </p>
          </CardFooter>
        </Card>
        <div className="space-y-4">
          <Link href="/create-video">
            <Button className="w-full bg-red-600 px-8 py-6 text-lg text-white hover:bg-red-700 sm:w-auto">
              Start Creating Videos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
