"use client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { SignInProviders } from "~/app/_components/signin-providers";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Sign in or create your Vid
              <span className="text-red-600">Gen</span> account
            </h2>
          </div>
          <SignInProviders />
        </div>
      </div>
    </div>
  );
}
