import { Progress } from "~/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Loader2, Video, Wand2, Upload } from "lucide-react";

interface VideoGenerationPopupProps {
  isGenerating: boolean;
  videoProgress: number | null;
  currentStage: number;
}

const stages = [
  { icon: Wand2, label: "Processing script", value: 0 },
  { icon: Upload, label: "Generating audio", value: 1 },
  { icon: Video, label: "Creating video", value: 2 },
];

export default function VideoGenerationPopup({
  isGenerating,
  videoProgress,
  currentStage,
}: VideoGenerationPopupProps) {
  if (!isGenerating) return null;

  console.log("videoProgress", videoProgress);
  console.log("currentStage", currentStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Creating Your VidGen Masterpiece
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-gray-200"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                />
                <circle
                  className="progress-ring stroke-current text-red-500"
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (videoProgress ?? 0) * 251.2}
                />
              </svg>
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-red-600" />
              </div>
            </div>
          </div>
          <Progress value={(videoProgress ?? 0) * 100} className="w-full" />
          <p className="text-center text-lg font-semibold">
            {Math.round((videoProgress ?? 0) * 100)}% Complete
          </p>
          <div className="space-y-2">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center space-x-2">
                <stage.icon
                  className={`h-6 w-6 ${index <= currentStage ? "text-red-500" : "text-gray-400"}`}
                />
                <span
                  className={
                    index <= currentStage ? "font-semibold" : "text-gray-500"
                  }
                >
                  {stage.label}
                </span>
                {index < currentStage && (
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-gray-500">
            Hang tight! We &apos re crafting your video with care. This may take
            a few minutes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
