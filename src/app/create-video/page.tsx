"use client";
/* eslint-disable */

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { Download, LoaderIcon, Wand2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import VideoPlayer916, {
  type VideoPlayer916Ref,
} from "../_components/video-169";
import { Tooltip, TooltipProvider } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import VideoGenerationPopup from "../_components/video-generation-popup";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Checkbox } from "~/components/ui/checkbox";
import Link from "next/link";
export const maxDuration = 60;

const baseFootageOptions = [
  { value: "minecraft", label: "Minecraft" },
  { value: "subwaysurfer", label: "Subway Surfer" },
  { value: "slime", label: "Slime" },
] as const;

export type Font = (typeof fontOptions)[number]["value"];
export type BaseFootage = (typeof baseFootageOptions)[number]["value"];

const fontOptions = [
  { value: "helvetica", label: "Helvetica" },
  { value: "arial", label: "Arial" },
] as const;

const voiceOptions = [
  { value: "pNInz6obpgDQGcFmaJgB", label: "Adam" },
  { value: "ErXwobaYiN019PkySvjV", label: "Antoni" },
  { value: "VR6AewLTigWG4xSOukaG", label: "Arnold" },
  { value: "2EiwWnXFnvU5JabPnv8n", label: "Clyde" },
  { value: "CYw3kZ02Hs0563khs1Fj", label: "Dave" },
  { value: "ThT5KcBeYPX3keUQqHPh", label: "Dorothy" },
  { value: "29vD33N1CtxCmqQRPOHJ", label: "Drew" },
  { value: "LcfcDJNUP1GQjkzn1xUU", label: "Emily" },
  { value: "g5CIjZEefAph4nQFvHAz", label: "Ethan" },
  { value: "D38z5RcWu1voky8WS1ja", label: "Fin" },
  { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah" },
  { value: "FGY2WhTYpPnrIDTdsKH5", label: "Laura" },
  { value: "IKne3meq5aSn9XLyUdCD", label: "Charlie" },
  { value: "JBFqnCBsd6RMkjVDRZzb", label: "George" },
  { value: "N2lVS1w4EtoT3dr4eOWO", label: "Callum" },
  { value: "TX3LPaxmHKxFdv7VOQHJ", label: "Liam" },
  { value: "XB0fDUnXU5powFXDhCwa", label: "Charlotte" },
  { value: "Xb7hH8MSUJpSbSDYk0k2", label: "Alice" },
  { value: "XrExE9yKIg1WjnnlVkGX", label: "Matilda" },
  { value: "bIHbv24MWmeRgasZH58o", label: "Will" },
  { value: "cgSgspJ2msm6clMCkdW9", label: "Jessica" },
  { value: "cjVigY5qzO86Huf0OWal", label: "Eric" },
  { value: "iP95p4xoKVk53GoZ742B", label: "Chris" },
  { value: "nPczCjzI2devNBz1zQrb", label: "Brian" },
  { value: "onwK4e9ZLuTAKqWW03F9", label: "Daniel" },
  { value: "pFZP5JQG7iQjIQuC4Bku", label: "Lily" },
  { value: "pqHfZKP75CvOlQylNhV4", label: "Bill" },
];

type VideoCreatorFormValues = {
  text: string;
  voice: string;
  wordsPerCaption: number;
  fontSize: number;
  font: string;
  fontColor: string;
  backgroundColor: string;
  showBackground: boolean;
  baseFootage: string;
  textBorderColor: string;
  textBorderSize: number;
  showBorder: boolean;
};

export default function VideoCreator() {
  const session = useSession();
  const videoRef = useRef<VideoPlayer916Ref>(null);
  const [formValues, setFormValues] = useState<VideoCreatorFormValues>({
    text: "",
    voice: voiceOptions[0]!.value,
    wordsPerCaption: 1,
    fontSize: 60,
    font: "helvetica",
    fontColor: "#FFFFFF",
    backgroundColor: "#000000",
    baseFootage: "minecraft",
    showBackground: true,
    textBorderColor: "#000000",
    textBorderSize: 8,
    showBorder: false,
  });
  const {
    text,
    voice,
    wordsPerCaption,
    fontSize,
    font,
    fontColor,
    backgroundColor,
    baseFootage,
    textBorderColor,
    showBackground,
    showBorder,
    textBorderSize,
  } = formValues;
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { mutate: completeVideoGeneration } =
    api.video.completeVideoGeneration.useMutation({
      onError: (err) => {
        console.error(err);
      },
      onSuccess: () => {
        refetchVideoData();
      },
    });

  const { mutate: generateVideo } = api.video.generateVideo.useMutation({
    onSettled: () => {
      router.refresh();
      refetchVideoData()
        .then(() => {
          setIsGenerating(false);
          completeVideoGeneration();
        })
        .catch((err) => {
          console.error(err);
        });
    },
    onSuccess: (video) => {
      setVideoUrl(video.videoUrl);
      setError(null);
    },
    onError: (err) => {
      console.log(err.message);
      if (err.message.includes("Not enough tokens")) {
        setError("TOKENS");
        return;
      } else if (err.message.includes("No API key found")) {
        setError("API");
        return;
      } else {
        setError("Error generating video. Please try again.");
      }
      console.error(err);
    },
  });

  const { data: videoData, refetch: refetchVideoData } =
    api.video.getLatestVideoProgress.useQuery(undefined, {
      refetchInterval: isGenerating ? 500 : undefined,
    });

  useEffect(() => {
    const formValues = localStorage.getItem("video-creator-form-values");
    if (formValues) {
      const values = JSON.parse(formValues) as VideoCreatorFormValues;
      setFormValues(values);
    }
  }, []);

  const handleChangeFormValues =
    (field: keyof VideoCreatorFormValues) => (e: any) => {
      const value = e.target ? e.target.value : e;
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
      localStorage.setItem(
        "video-creator-form-values",
        JSON.stringify({
          ...formValues,
          [field]: value,
        }),
      );
    };

  const handleGenerate = () => {
    setIsGenerating(true);
    generateVideo({
      text,
      voiceId: voice,
      wordsPerCaption,
      fontSize: Number(fontSize),
      fontColor,
      backgroundColor,
      baseFootage: baseFootage as BaseFootage,
      font: font as Font,
      showBackground,
      textBorderColor,
      textBorderSize: Number(textBorderSize),
      showBorder,
    });
  };

  const handleDownloadVideo = () => {
    if (videoRef.current) {
      videoRef.current.download();
    }
  };

  if (session.status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold">
          Create Your <span className="text-red-600">VidGen</span> Masterpiece
        </h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Video Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="text">Script</Label>
                    <Textarea
                      id="text"
                      placeholder="Enter your video script here..."
                      value={text}
                      onChange={handleChangeFormValues("text")}
                      className="h-32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="voice">Voice</Label>
                    <Select
                      value={voice}
                      onValueChange={handleChangeFormValues("voice")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="baseFootage">Base Footage</Label>
                    <Select
                      value={baseFootage}
                      onValueChange={handleChangeFormValues("baseFootage")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select base footage" />
                      </SelectTrigger>
                      <SelectContent>
                        {baseFootageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label htmlFor="wordsPerCaption">Words Per Caption</Label>
                    <Slider
                      id="wordsPerCaption"
                      min={1}
                      max={10}
                      step={1}
                      value={[wordsPerCaption]}
                      onValueChange={(value) =>
                        handleChangeFormValues("wordsPerCaption")(value[0]!)
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {wordsPerCaption} words
                    </span>
                  </div>
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Slider
                      id="fontSize"
                      min={12}
                      max={100}
                      step={1}
                      value={[fontSize]}
                      onValueChange={(value) =>
                        handleChangeFormValues("fontSize")(value[0]!)
                      }
                    />
                    <span className="text-sm text-gray-500">{fontSize}px</span>
                  </div>
                  <div>
                    <Label htmlFor="font">Font</Label>
                    <Select
                      value={font}
                      onValueChange={handleChangeFormValues("font")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fontColor">Font Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="fontColor"
                        type="color"
                        value={fontColor}
                        onChange={handleChangeFormValues("fontColor")}
                        className="h-10 w-10 rounded p-1"
                      />
                      <Input
                        type="text"
                        value={fontColor}
                        onChange={handleChangeFormValues("fontColor")}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="showBackground">Show Background Box</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showBackground"
                        checked={showBackground}
                        onCheckedChange={handleChangeFormValues(
                          "showBackground",
                        )}
                      ></Checkbox>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={backgroundColor}
                        disabled={!showBackground}
                        onChange={handleChangeFormValues("backgroundColor")}
                        className="h-10 w-10 rounded p-1"
                      />
                      <Input
                        type="text"
                        disabled={!showBackground}
                        value={backgroundColor}
                        onChange={handleChangeFormValues("backgroundColor")}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="showBorder">Show Text Border</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showBorder"
                        checked={showBorder}
                        onCheckedChange={handleChangeFormValues("showBorder")}
                      ></Checkbox>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="textBorderColor">Text Border Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="textBorderColor"
                        type="color"
                        value={textBorderColor}
                        disabled={!showBorder}
                        onChange={handleChangeFormValues("textBorderColor")}
                        className="h-10 w-10 rounded p-1"
                      />
                      <Input
                        type="text"
                        value={textBorderColor}
                        disabled={!showBorder}
                        onChange={handleChangeFormValues("textBorderColor")}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="backgroundColor">Text Border Size</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="textBorderSize"
                        type="number"
                        disabled={!showBorder}
                        value={textBorderSize}
                        onChange={handleChangeFormValues("textBorderSize")}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex w-full justify-center">
                <VideoPlayer916 ref={videoRef} src={videoUrl ?? ""} />
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDownloadVideo}
                        disabled={!videoUrl}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download video</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download video</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !text}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isGenerating ? (
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-600">
            {error === "API" ? (
              <>
                <p>
                  API key not set. Please set your API key to generate videos.
                </p>
                <Link href="change-api-key">
                  <Button className="mt-2 bg-red-600 hover:bg-red-700">
                    Set API Key
                  </Button>
                </Link>
              </>
            ) : error === "TOKENS" ? (
              <>
                <p>
                  Not enough tokens to generate video. Please purchase more
                  tokens.
                </p>
                <Link href="/pricing">
                  <Button className="mt-2 bg-red-600 hover:bg-red-700">
                    Purchase Tokens
                  </Button>
                </Link>
              </>
            ) : (
              <p>{error}</p>
            )}
          </div>
        )}
      </div>

      <VideoGenerationPopup
        isGenerating={isGenerating}
        currentStage={videoData?.step ?? 0}
      />
    </div>
  );
}
