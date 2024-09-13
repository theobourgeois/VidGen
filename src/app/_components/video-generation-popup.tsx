import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Video, Wand2, Upload } from "lucide-react";

interface VideoGenerationPopupProps {
  isGenerating: boolean;
  currentStage: number;
}

const stages = [
  { icon: Wand2, label: "Processing script", value: 0 },
  { icon: Upload, label: "Generating audio", value: 1 },
  { icon: Video, label: "Creating video", value: 2 },
];

export default function VideoGenerationPopup({
  isGenerating,
  currentStage,
}: VideoGenerationPopupProps) {
  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Creating Your VidGen Masterpiece
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
            Hang tight! We&apos;re crafting your video with care. This may take
            a few minutes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
