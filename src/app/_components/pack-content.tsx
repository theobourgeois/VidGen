import { Clock, Zap, Infinity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { PaymentButton } from "./payment-button";

export type Pack = "starter" | "creator" | "pro";

export function getPackVideoMinutes(pack: Pack) {
  return getPackTokenCount(pack) / 1000;
}

export function getPackTokenCount(pack: Pack) {
  switch (pack) {
    case "starter":
      return 10000;
    case "creator":
      return 50000;
    case "pro":
      return 500000;
  }
}

export function getPackPrice(pack: Pack) {
  switch (pack) {
    case "starter":
      return 5;
    case "creator":
      return 10;
    case "pro":
      return 50;
  }
}

export function getPackTitle(pack: Pack) {
  switch (pack) {
    case "starter":
      return "Starter Pack";
    case "creator":
      return "Creator Pack";
    case "pro":
      return "Pro Pack";
  }
}

export function getPackDescription(pack: Pack) {
  switch (pack) {
    case "starter":
      return "For quick projects";
    case "creator":
      return "Best value for regular creators";
    case "pro":
      return "For power users";
  }
}

export function PackFeatures({ pack }: { pack: Pack }) {
  switch (pack) {
    case "starter":
      return (
        <ul className="space-y-2">
          <li className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-red-500" />
            10,000 tokens
          </li>
          <li className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-red-500" />
            ~10 minutes of video
          </li>
          <li className="flex items-center">
            <Infinity className="mr-2 h-5 w-5 text-red-500" />
            No expiration
          </li>
        </ul>
      );
    case "creator":
      return (
        <ul className="space-y-2">
          <li className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-red-500" />
            50,000 tokens
          </li>
          <li className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-red-500" />
            ~50 minutes of video
          </li>
          <li className="flex items-center">
            <Infinity className="mr-2 h-5 w-5 text-red-500" />
            No expiration
          </li>
        </ul>
      );
    case "pro":
      return (
        <ul className="space-y-2">
          <li className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-red-500" />
            500,000 tokens
          </li>
          <li className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-red-500" />
            ~500 minutes of video
          </li>
          <li className="flex items-center">
            <Infinity className="mr-2 h-5 w-5 text-red-500" />
            No expiration
          </li>
        </ul>
      );
  }
}

export function PackContent({
  pack,
  buyButton = true,
}: {
  pack: Pack;
  buyButton?: boolean;
}) {
  switch (pack) {
    case "starter":
      return (
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Starter Pack</CardTitle>
            <CardDescription>For quick projects</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-2 text-4xl font-bold">$5</div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-red-500" />
                10,000 tokens
              </li>
              <li className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-red-500" />
                ~10 minutes of video
              </li>
              <li className="flex items-center">
                <Infinity className="mr-2 h-5 w-5 text-red-500" />
                No expiration
              </li>
            </ul>
          </CardContent>
          {buyButton && (
            <CardFooter>
              <PaymentButton pack={pack}>Buy Starter Pack</PaymentButton>
            </CardFooter>
          )}
        </Card>
      );
    case "creator":
      return (
        <Card className="flex flex-col border-red-600">
          <CardHeader>
            <CardTitle className="text-2xl">Creator Pack</CardTitle>
            <CardDescription>Best value for regular creators</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-2 text-4xl font-bold">$10</div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-red-500" />
                50,000 tokens
              </li>
              <li className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-red-500" />
                ~50 minutes of video
              </li>
              <li className="flex items-center">
                <Infinity className="mr-2 h-5 w-5 text-red-500" />
                No expiration
              </li>
            </ul>
          </CardContent>
          {buyButton && (
            <CardFooter>
              <PaymentButton pack={pack}>Buy Creator Pack</PaymentButton>
            </CardFooter>
          )}
        </Card>
      );
    case "pro":
      return (
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl">Pro Pack</CardTitle>
            <CardDescription>For power users</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="mb-2 text-4xl font-bold">$50</div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Zap className="mr-2 h-5 w-5 text-red-500" />
                500,000 tokens
              </li>
              <li className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-red-500" />
                ~500 minutes of video
              </li>
              <li className="flex items-center">
                <Infinity className="mr-2 h-5 w-5 text-red-500" />
                No expiration
              </li>
            </ul>
          </CardContent>
          {buyButton && (
            <CardFooter>
              <PaymentButton pack={pack}>Buy Pro Pack</PaymentButton>
            </CardFooter>
          )}
        </Card>
      );
    default:
      return <></>;
  }
}
