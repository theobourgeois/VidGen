import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { PaymentButton } from "../_components/payment-button";
import {
  getPackDescription,
  getPackPrice,
  getPackTitle,
  PackFeatures,
} from "../_components/pack-content";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex-1 px-4 py-12 md:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
            Choose Your Token Package
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Buy tokens and create amazing videos on demand
          </p>
          <p>
            ElevenLabs API Key is required to generate videos. Set your API key{" "}
            <a className="text-red-600" href="/change-api-key">
              here
            </a>
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">
                {getPackTitle("starter")}
              </CardTitle>
              <CardDescription>{getPackDescription("starter")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-2 text-4xl font-bold">
                ${getPackPrice("starter")}
              </div>
              <PackFeatures pack="starter" />
            </CardContent>
            <CardFooter>
              <PaymentButton pack="starter">
                Buy {getPackTitle("starter")}
              </PaymentButton>
            </CardFooter>
          </Card>
          <Card className="flex flex-col border-red-600">
            <CardHeader>
              <CardTitle className="text-2xl">
                {getPackTitle("creator")}
              </CardTitle>
              <CardDescription>{getPackDescription("creator")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-2 text-4xl font-bold">
                <span className="text-gray-700 line-through">$20</span> $
                {getPackPrice("creator")}
              </div>
              <PackFeatures pack="creator" />
            </CardContent>
            <CardFooter>
              <PaymentButton pack="creator">
                Buy {getPackTitle("creator")}
              </PaymentButton>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{getPackTitle("pro")}</CardTitle>
              <CardDescription>{getPackDescription("pro")}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-2 text-4xl font-bold">
                ${getPackPrice("pro")}
              </div>
              <PackFeatures pack="pro" />
            </CardContent>
            <CardFooter>
              <PaymentButton pack="pro">
                Buy {getPackTitle("pro")}
              </PaymentButton>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
