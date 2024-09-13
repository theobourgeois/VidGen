import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Video, Wand2, Share2, Rocket } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          About Vid<span className="text-red-600">Gen</span>
        </h1>
        <p className="mb-12 text-xl text-gray-600 dark:text-gray-300">
          Unleash your creativity with{" "}
          <span className="font-semibold text-black">
            Vid<span className="text-red-600">Gen</span>
          </span>{" "}
          - the simple, powerful video generation app that turns your ideas into
          shareable content in minutes.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Wand2 className="h-6 w-6 text-red-600" />
                <span>Effortless Creation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Choose your background footage, write your script, and let
                VidGen work its magic. Creating engaging videos has never been
                easier.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Share2 className="h-6 w-6 text-red-600" />
                <span>Share Instantly</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Generate videos perfect for social media, presentations, or any
                platform. Share your message with the world in just a few
                clicks.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 space-y-8">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-center md:space-x-8 md:space-y-0">
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900">
                <Video className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Choose Background</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900">
                <Wand2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Write Script</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900">
                <Rocket className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Generate & Share</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-6 text-3xl font-bold">Ready to Create?</h2>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/create-video">Start Generating Videos</Link>
          </Button>
        </div>

        <div className="mt-16 text-sm text-gray-600 dark:text-gray-400">
          <p>
            VidGen is designed for creators, marketers, educators, and anyone
            who wants to share their message through engaging video content. Our
            mission is to make video creation accessible and enjoyable for
            everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
