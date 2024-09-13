import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Zap, Wand2, Share2, Palette, CloudUpload, Mic } from "lucide-react";
import Link from "next/link";

export default function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Quick Generation",
      description:
        "Create engaging videos in minutes, not hours. Perfect for social media content creators on the go.",
    },
    {
      icon: Wand2,
      title: "AI-Powered Voiceovers",
      description: (
        <>
          Lifelike narration powered by cutting-edge AI technology from{" "}
          <Link
            href="https://elevenlabs.io/"
            className="text-red-600 hover:underline"
          >
            ElevenLabs
          </Link>
        </>
      ),
    },
    {
      icon: Palette,
      title: "Customizable Styles",
      description:
        "Choose from a variety of background footage options and customize text styles to match your brand.",
    },
    {
      icon: Mic,
      title: "Multiple Voice Options",
      description:
        "Select from a diverse range of AI voices to find the perfect narrator for your video.",
    },
    {
      icon: CloudUpload,
      title: "Instant Rendering",
      description:
        "Our cloud-based rendering ensures your videos are processed quickly and efficiently.",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description:
        "Download your videos in high quality or share directly to major social media platforms with a single click.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter text-gray-800 sm:text-5xl dark:text-white">
          Powerful Features for Effortless Video Creation
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader>
                <feature.icon className="mb-4 h-12 w-12 text-red-600" />
                <CardTitle className="text-xl font-bold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
