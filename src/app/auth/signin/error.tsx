"use client";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertCircle, ArrowLeft, Video } from "lucide-react";
import Link from "next/link";

export default function SignInErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Link
        href="/"
        className="mb-8 flex items-center text-2xl font-bold text-gray-900 dark:text-white"
      >
        <Video className="mr-2 h-8 w-8" />
        Vid<span className="text-red-600">Gen</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-red-600">
            <AlertCircle className="mr-2 h-6 w-6" />
            Sign-In Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 dark:text-gray-300">
            We couldn &apos t sign you in due to a technical issue. Please try
            again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full bg-red-600 hover:bg-red-700">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
