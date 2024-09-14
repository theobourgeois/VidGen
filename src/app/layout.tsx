import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import UserAvatar from "./_components/user-avatar";
import { SessionProvider } from "./_components/providers";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "VidGen",
  description: "short-form content generator",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sessionData = await getServerAuthSession();
  await api.user.getUserTokens.prefetch();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <header className="flex h-14 items-center bg-white px-4 shadow-sm dark:bg-gray-800 lg:px-6">
            <Link className="flex items-center justify-center" href="/">
              <span className="ml-1 text-3xl font-bold text-gray-800 dark:text-white">
                Vid<span className="text-red-600">Gen</span>
              </span>
            </Link>
            <nav className="ml-auto flex items-center gap-4 text-black sm:gap-6">
              <Link href="/create-video">
                <Button className="flex bg-red-600 text-white hover:bg-red-500 hover:text-white">
                  Create Video
                </Button>
              </Link>
              <Link
                className="hidden text-sm font-medium hover:text-red-600 dark:hover:text-red-400 md:block"
                href="/#features"
              >
                Features
              </Link>
              <Link
                className="hidden text-sm font-medium hover:text-red-600 dark:hover:text-red-400 sm:block"
                href="/pricing"
              >
                Pricing
              </Link>
              <Link
                className="hidden text-sm font-medium hover:text-red-600 dark:hover:text-red-400 sm:block"
                href="/about"
              >
                About
              </Link>
              {sessionData?.user ? (
                <UserAvatar
                  name={sessionData.user.name ?? ""}
                  email={sessionData.user.email ?? ""}
                />
              ) : (
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    className="flex border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </header>
          <SessionProvider>{children}</SessionProvider>
        </TRPCReactProvider>
        <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t bg-white px-4 py-6 dark:bg-gray-800 sm:flex-row md:px-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} VidGen. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:ml-auto sm:gap-6">
            {/* <Link
              className="text-xs text-gray-500 underline-offset-4 hover:text-red-600 hover:underline dark:text-gray-400 dark:hover:text-red-400"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs text-gray-500 underline-offset-4 hover:text-red-600 hover:underline dark:text-gray-400 dark:hover:text-red-400"
              href="#"
            >
              Privacy
            </Link> */}
          </nav>
        </footer>
      </body>
    </html>
  );
}
