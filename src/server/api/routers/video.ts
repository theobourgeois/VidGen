import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
  decryptAPIKey,
  type Font,
  generateVideo,
  getElevenLabsTextToSpeechData,
  getFfmpegVideoTextFilters,
} from "~/server/lib/video";

const characterEndTimes = [
  { character: "h", endTime: 0.1 },
  { character: "e", endTime: 0.15 },
  { character: "l", endTime: 0.2 },
  { character: "l", endTime: 0.25 },
  { character: "o", endTime: 0.3 },
  { character: " ", endTime: 0.35 },
  { character: "w", endTime: 0.4 },
  { character: "o", endTime: 0.45 },
  { character: "r", endTime: 0.5 },
  { character: "l", endTime: 0.55 },
  { character: "d", endTime: 0.6 },
  { character: " ", endTime: 0.65 },
  { character: "m", endTime: 0.7 },
  { character: "y", endTime: 0.75 },
  { character: " ", endTime: 0.8 },
  { character: "n", endTime: 0.85 },
  { character: "a", endTime: 0.9 },
  { character: "m", endTime: 0.95 },
  { character: "e", endTime: 1.0 },
  { character: " ", endTime: 1.05 },
  { character: "i", endTime: 1.1 },
  { character: "s", endTime: 1.15 },
  { character: " ", endTime: 1.2 },
  { character: "t", endTime: 1.25 },
  { character: "h", endTime: 1.3 },
  { character: "e", endTime: 1.35 },
  { character: "o", endTime: 1.4 },
  { character: ",", endTime: 1.45 },
  { character: " ", endTime: 1.5 },
  { character: "t", endTime: 1.55 },
  { character: "h", endTime: 1.6 },
  { character: "i", endTime: 1.65 },
  { character: "s", endTime: 1.7 },
  { character: " ", endTime: 1.75 },
  { character: "i", endTime: 1.8 },
  { character: "s", endTime: 1.85 },
  { character: " ", endTime: 1.9 },
  { character: "a", endTime: 1.95 },
  { character: " ", endTime: 2.0 },
  { character: "t", endTime: 2.05 },
  { character: "e", endTime: 2.1 },
  { character: "s", endTime: 2.15 },
  { character: "t", endTime: 2.2 },
  { character: "!", endTime: 2.25 },
];

type VideoBaseFootage = keyof typeof baseFootageToFile;

const baseFootageToFile = {
  minecraft: "minecraft.mp4",
};

export const videoRouter = createTRPCRouter({
  generateVideo: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(6000),
        voiceId: z.string(),
        wordsPerCaption: z.number().int().min(1).max(15),
        fontSize: z.number().int().min(1).max(100),
        font: z.custom<Font>(),
        fontColor: z.string().min(1).max(7),
        backgroundColor: z.string().min(1).max(7),
        baseFootage: z.custom<VideoBaseFootage>(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // const encryptedKey = (
        //   await ctx.db
        //     .select({
        //       apiKey: users.encrytedElevenLabsApiKey,
        //     })
        //     .from(users)
        //     .where(eq(users.id, ctx.session.user.id))
        // )[0]?.apiKey;

        // if (!encryptedKey) {
        //   throw new Error("No API key found");
        // }

        // const apiKey = decryptAPIKey(encryptedKey);
        // const { audioBase64, characterEndTimes } =
        //   await getElevenLabsTextToSpeechData(
        //     input.text,
        //     input.voiceId,
        //     apiKey,
        //   );.
        const audioBase64 = "audioBase64";

        console.log("ElevenLabsApi response processed:", {
          audioBase64: audioBase64.slice(0, 10) + "...",
          characterEndTimes,
        });

        const textFilters = getFfmpegVideoTextFilters(
          characterEndTimes,
          input.wordsPerCaption,
          input.fontSize,
          input.fontColor,
          input.font,
          input.backgroundColor,
        );
        console.log("Text filters processed:", textFilters);

        const footageFilename = baseFootageToFile[input.baseFootage];
        const videoLength = characterEndTimes.reduce(
          (acc, { endTime }) => Math.max(acc, endTime),
          0,
        );
        const video = await generateVideo(
          audioBase64,
          textFilters,
          footageFilename,
          videoLength,
        );
        if (video.error) {
          throw new Error(video.error);
        }

        return {
          videoUrl: video.videoUrl,
        }
      } catch (error) {
        throw new Error("Failed to generate video: " + `${error as string}`);
      }
    }),
});
