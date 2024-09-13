import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Zap, Wand2, Share2 } from "lucide-react";
import Image from "next/image";
import FeaturesSection from "./_components/features";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex-1">
        <section className="flex w-full justify-center bg-gradient-to-r from-red-500 via-red-600 to-red-700 py-12 text-white md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Create Stunning Short-Form Videos in Minutes
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                  VidGen helps you generate engaging short-form videos for
                  social media with just a few clicks. Boost your content
                  strategy today!
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/pricing">
                  <Button className="bg-white text-red-600 hover:bg-gray-100">
                    Get Started
                  </Button>
                </Link>
                <Link href="/about">
                  <Button className="border-white bg-red-700 text-white hover:bg-red-600">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="flex w-full justify-center bg-white py-12 md:py-24 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter text-gray-800 sm:text-5xl dark:text-white">
              Featured Videos
            </h2>
            <div className="flex justify-center space-x-4 md:space-x-8">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="relative h-96 w-56 overflow-hidden rounded-lg bg-gray-200 shadow-lg"
                >
                  <Image
                    src={`/placeholder.svg?height=384&width=216`}
                    alt={`Featured video ${index}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="features"
          className="flex w-full justify-center bg-gray-50 py-12 md:py-24 lg:py-32 dark:bg-gray-900"
        >
          <FeaturesSection></FeaturesSection>
        </section>
        <section className="flex w-full justify-center bg-gradient-to-r from-red-500 via-red-600 to-red-700 py-12 text-white md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Start Creating Today
                </h2>
                <p className="max-w-[600px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of content creators who trust VidGen for their
                  short-form video needs.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Link href="/auth/signup">
                  <Button
                    type="submit"
                    className="bg-white text-red-600 hover:bg-gray-100"
                  >
                    Sign Up
                  </Button>
                </Link>
                <p className="text-xs text-gray-200">
                  By signing up, you agree to our{" "}
                  <Link
                    className="underline underline-offset-2 hover:text-gray-100"
                    href="#"
                  >
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
