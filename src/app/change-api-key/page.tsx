"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const router = useRouter();
  const { mutate } = api.user.updateApiKey.useMutation({
    onSuccess: () => {
      alert("API key updated successfully");
      setApiKey("");
      router.push("/create-video");
    },
    onError: (error) => {
      alert("Failed to update API key: " + error.message);
    },
  });

  const handleSave = () => {
    mutate({ apiKey });
  };

  return (
    <main className="flex-1 px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="mb-6 text-3xl font-bold">
          Eleven Labs API Key Settings
        </h1>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Why do I need an Eleven Labs API key?</AlertTitle>
          <AlertDescription>
            <p className="mt-2">The Eleven Labs API key is essential for:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Generating high-quality voice-overs for your videos</li>
              <li>Accessing a wide range of voice options</li>
              <li>Customizing voice parameters for your content</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Set Your API Key</CardTitle>
            <CardDescription>
              Enter your Eleven Labs API key to enable voice generation features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Eleven Labs API Key</Label>
              <Input
                autoFocus
                id="api-key"
                type="password"
                placeholder="Enter your Eleven Labs API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Don't have an API key?</p>
              <a
                href="https://www.youtube.com/watch?v=EDsiFLo6mLE"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center text-red-600 hover:underline"
              >
                Learn how to get your Eleven Labs API key
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              disabled={!apiKey}
              onClick={handleSave}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              Save API Key
            </Button>
          </CardFooter>
        </Card>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Keep your API key secure</AlertTitle>
          <AlertDescription>
            Never share your API key publicly or with unauthorized individuals.
            VidGen securely stores and uses your key for voice generation
            purposes only.
          </AlertDescription>
        </Alert>
      </div>
    </main>
  );
}
