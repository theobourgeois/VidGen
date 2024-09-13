"use client";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { AlertCircle, Video } from "lucide-react";
import { SignInProviders } from "~/app/_components/signin-providers";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function CreateAccountPage() {
  const [fullName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { mutate } = api.user.createAccount.useMutation({
    onSuccess: () => {
      signIn("credentials", {
        email,
        password,
        redirect: false,
      }).then(() => {
        router.push("/");
        router.refresh();
      });
    },
    onError: (error) => {
      setError(error.message);
    },
  });
  // const [termsAccepted, setTermsAccepted] = useState(false);

  const isSaveDisabled = !fullName || !email || !password || !passwordConfirm;

  const handleCreateAccount = () => {
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    mutate({
      email,
      name: fullName,
      password,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <Video className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h2>
            {/* <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-red-600 hover:text-red-500"
              >
                Sign in
              </Link>
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <Label
                  htmlFor="full-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </Label>
                <Input
                  onChange={(e) => setUsername(e.target.value)}
                  value={fullName}
                  id="full-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </Label>
                <Input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label
                  htmlFor="password-confirm"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm Password
                </Label>
                <Input
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  value={passwordConfirm}
                  id="password-confirm"
                  name="password_confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div> */}

            {/* <div className="flex items-center">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(value) => setTermsAccepted(Boolean(value))}
                id="terms-and-privacy"
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label
                htmlFor="terms-and-privacy"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                I agree to the{" "}
                <Link
                  href="#"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div> */}

            {/* <div>
              <Button
                disabled={isSaveDisabled}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={handleCreateAccount}
              >
                Create Account
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )} */}
          </div>
          <SignInProviders />
        </div>
      </main>
    </div>
  );
}
