import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users, videos } from "~/server/db/schema";
import { eq, desc, and, } from "drizzle-orm";
import {
  decryptAPIKey,
  fontToFontUrl,
  GC_VIDEO_BUCKET_NAME,
  generateVideoCloudFn,
  getElevenLabsTextToSpeechData,
  getFfmpegVideoTextFilters,
  uploadFileToGCS,
} from "~/server/lib/video";
import { encode } from "gpt-tokenizer";
import { type BaseFootage, type Font } from "~/app/create-video/page";
import { v4 as uuidv4 } from "uuid";

const characterEndTimes = [
  { character: 'w', startTime: 4.029, endTime: 4.063 },
  { character: 'i', startTime: 4.063, endTime: 4.11 },
  { character: 't', startTime: 4.11, endTime: 4.156 },
  { character: 'h', startTime: 4.156, endTime: 4.191 },
  { character: ' ', startTime: 4.191, endTime: 4.249 },
  { character: 'V', startTime: 4.249, endTime: 4.296 },
  { character: 'i', startTime: 4.296, endTime: 4.389 },
  { character: 'd', startTime: 4.389, endTime: 4.447 },
  { character: 'G', startTime: 4.447, endTime: 4.516 },
  { character: 'e', startTime: 4.516, endTime: 4.632 },
  { character: 'n', startTime: 4.632, endTime: 4.748 },
  { character: '.', startTime: 4.748, endTime: 4.923 },
  { character: ' ', startTime: 4.923, endTime: 5.735 },
  { character: 'F', startTime: 5.735, endTime: 5.817 },
  { character: 'i', startTime: 5.817, endTime: 5.886 },
  { character: 'r', startTime: 5.886, endTime: 5.944 },
  { character: 's', startTime: 5.944, endTime: 6.014 },
  { character: 't', startTime: 6.014, endTime: 6.072 },
  { character: ' ', startTime: 6.072, endTime: 6.165 },
  { character: '1', startTime: 6.165, endTime: 6.281 },
  { character: '0', startTime: 6.281, endTime: 6.525 },
  { character: '0', startTime: 6.525, endTime: 6.641 },
  { character: '0', startTime: 6.641, endTime: 6.757 },
  { character: ' ', startTime: 6.757, endTime: 6.827 },
  { character: 's', startTime: 6.827, endTime: 6.885 },
  { character: 'i', startTime: 6.885, endTime: 7.001 },
  { character: 'g', startTime: 7.001, endTime: 7.059 },
  { character: 'n', startTime: 7.059, endTime: 7.105 },
  { character: ' ', startTime: 7.105, endTime: 7.152 },
  { character: 'u', startTime: 7.152, endTime: 7.187 },
  { character: 'p', startTime: 7.187, endTime: 7.256 },
  { character: 's', startTime: 7.256, endTime: 7.303 },
  { character: ' ', startTime: 7.303, endTime: 7.361 },
  { character: 'g', startTime: 7.361, endTime: 7.396 },
  { character: 'e', startTime: 7.396, endTime: 7.465 },
  { character: 't', startTime: 7.465, endTime: 7.512 },
  { character: ' ', startTime: 7.512, endTime: 7.535 },
  { character: '$', startTime: 7.535, endTime: 7.558 },
  { character: '1', startTime: 7.558, endTime: 7.605 },
  { character: '0', startTime: 7.605, endTime: 8.046 },
  { character: ' ', startTime: 8.046, endTime: 8.115 },
  { character: 'o', startTime: 8.115, endTime: 8.197 },
  { character: 'f', startTime: 8.197, endTime: 8.278 },
  { character: 'f', startTime: 8.278, endTime: 8.394 },
  { character: ' ', startTime: 8.394, endTime: 8.568 },
  { character: 'o', startTime: 8.568, endTime: 8.684 },
  { character: 'n', startTime: 8.684, endTime: 8.731 },
  { character: ' ', startTime: 8.731, endTime: 8.847 },
  { character: '5', startTime: 8.847, endTime: 9.021 },
  { character: '0', startTime: 9.021, endTime: 9.172 },
  { character: ' ', startTime: 9.172, endTime: 9.265 },
  { character: 'm', startTime: 9.265, endTime: 9.311 },
  { character: 'i', startTime: 9.311, endTime: 9.369 },
  { character: 'n', startTime: 9.369, endTime: 9.416 },
  { character: 'u', startTime: 9.416, endTime: 9.462 },
  { character: 't', startTime: 9.462, endTime: 9.497 },
  { character: 'e', startTime: 9.497, endTime: 9.532 },
  { character: 's', startTime: 9.532, endTime: 9.567 },
  { character: ' ', startTime: 9.567, endTime: 9.613 },
  { character: 'o', startTime: 9.613, endTime: 9.636 },
  { character: 'f', startTime: 9.636, endTime: 9.659 },
  { character: ' ', startTime: 9.659, endTime: 9.718 },
  { character: 'v', startTime: 9.718, endTime: 9.764 },
  { character: 'i', startTime: 9.764, endTime: 9.857 },
  { character: 'd', startTime: 9.857, endTime: 9.915 },
  { character: 'e', startTime: 9.915, endTime: 10.031 },
  { character: 'o', startTime: 10.031, endTime: 10.182 },
  { character: '.', startTime: 10.182, endTime: 10.426 },
  { character: ' ', startTime: 10.426, endTime: 10.809 },
  { character: 'T', startTime: 10.809, endTime: 10.855 },
  { character: 'h', startTime: 10.855, endTime: 10.925 },
  { character: 'a', startTime: 10.925, endTime: 10.948 },
  { character: 't', startTime: 10.948, endTime: 10.995 },
  { character: "'", startTime: 10.995, endTime: 11.029 },
  { character: 's', startTime: 11.029, endTime: 11.064 },
  { character: ' ', startTime: 11.064, endTime: 11.134 },
  { character: 'l', startTime: 11.134, endTime: 11.18 },
  { character: 'i', startTime: 11.18, endTime: 11.238 },
  { character: 't', startTime: 11.238, endTime: 11.296 },
  { character: 'e', startTime: 11.296, endTime: 11.331 },
  { character: 'r', startTime: 11.331, endTime: 11.366 },
  { character: 'a', startTime: 11.366, endTime: 11.413 },
  { character: 'l', startTime: 11.413, endTime: 11.447 },
  { character: 'l', startTime: 11.447, endTime: 11.505 },
  { character: 'y', startTime: 11.505, endTime: 11.552 },
  { character: ' ', startTime: 11.552, endTime: 11.622 },
  { character: 'o', startTime: 11.622, endTime: 11.656 },
  { character: 'n', startTime: 11.656, endTime: 11.749 },
  { character: 'l', startTime: 11.749, endTime: 11.807 },
  { character: 'y', startTime: 11.807, endTime: 11.842 },
  { character: ' ', startTime: 11.842, endTime: 11.9 },
  { character: '1', startTime: 11.9, endTime: 11.958 },
  { character: '0', startTime: 11.958, endTime: 12.074 },
  { character: ' ', startTime: 12.074, endTime: 12.132 },
  { character: 'd', startTime: 12.132, endTime: 12.179 },
  { character: 'o', startTime: 12.179, endTime: 12.272 },
  { character: 'l', startTime: 12.272, endTime: 12.318 },
  { character: 'l', startTime: 12.318, endTime: 12.365 },
  { character: 'a', startTime: 12.365, endTime: 12.411 },
  { character: 'r', startTime: 12.411, endTime: 12.457 },
  { character: 's', startTime: 12.457, endTime: 12.492 },
  { character: ' ', startTime: 12.492, endTime: 12.539 },
  { character: 'f', startTime: 12.539, endTime: 12.574 },
  { character: 'o', startTime: 12.574, endTime: 12.62 },
  { character: 'r', startTime: 12.62, endTime: 12.655 },
  { character: ' ', startTime: 12.655, endTime: 12.713 },
  { character: 'l', startTime: 12.713, endTime: 12.759 },
  { character: 'i', startTime: 12.759, endTime: 12.794 },
  { character: 'k', startTime: 12.794, endTime: 12.841 },
  { character: 'e', startTime: 12.841, endTime: 12.887 },
  { character: ' ', startTime: 12.887, endTime: 12.934 },
  { character: '1', startTime: 12.934, endTime: 13.026 },
  { character: '0', startTime: 13.026, endTime: 13.201 },
  { character: '0', startTime: 13.201, endTime: 13.375 },
  { character: ' ', startTime: 13.375, endTime: 13.433 },
  { character: 'v', startTime: 13.433, endTime: 13.479 },
  { character: 'i', startTime: 13.479, endTime: 13.56 },
  { character: 'd', startTime: 13.56, endTime: 13.607 },
  { character: 'e', startTime: 13.607, endTime: 13.723 },
  { character: 'o', startTime: 13.723, endTime: 13.839 },
  { character: 's', startTime: 13.839, endTime: 13.886 },
  { character: ' ', startTime: 13.886, endTime: 13.944 },
  { character: 'o', startTime: 13.944, endTime: 13.99 },
  { character: 'r', startTime: 13.99, endTime: 14.025 },
  { character: ' ', startTime: 14.025, endTime: 14.083 },
  { character: 's', startTime: 14.083, endTime: 14.118 },
  { character: 'o', startTime: 14.118, endTime: 14.176 },
  { character: 'm', startTime: 14.176, endTime: 14.211 },
  { character: 'e', startTime: 14.211, endTime: 14.245 },
  { character: 't', startTime: 14.245, endTime: 14.28 },
  { character: 'h', startTime: 14.28, endTime: 14.327 },
  { character: 'i', startTime: 14.327, endTime: 14.362 },
  { character: 'n', startTime: 14.362, endTime: 14.396 },
  { character: 'g', startTime: 14.396, endTime: 14.466 },
  { character: '.', startTime: 14.466, endTime: 14.71 },
  { character: ' ', startTime: 14.71, endTime: 15.406 },
  { character: 'C', startTime: 15.406, endTime: 15.499 },
  { character: 'l', startTime: 15.499, endTime: 15.557 },
  { character: 'i', startTime: 15.557, endTime: 15.592 },
  { character: 'c', startTime: 15.592, endTime: 15.639 },
  { character: 'k', startTime: 15.639, endTime: 15.673 },
  { character: ' ', startTime: 15.673, endTime: 15.743 },
  { character: 't', startTime: 15.743, endTime: 15.766 },
  { character: 'h', startTime: 15.766, endTime: 15.79 },
  { character: 'e', startTime: 15.79, endTime: 15.813 },
  { character: ' ', startTime: 15.813, endTime: 15.882 },
  { character: 'l', startTime: 15.882, endTime: 15.917 },
  { character: 'i', startTime: 15.917, endTime: 15.975 },
  { character: 'n', startTime: 15.975, endTime: 16.033 },
  { character: 'k', startTime: 16.033, endTime: 16.08 },
  { character: ' ', startTime: 16.08, endTime: 16.138 },
  { character: 'i', startTime: 16.138, endTime: 16.161 },
  { character: 'n', startTime: 16.161, endTime: 16.196 },
  { character: ' ', startTime: 16.196, endTime: 16.277 },
  { character: 'b', startTime: 16.277, endTime: 16.335 },
  { character: 'i', startTime: 16.335, endTime: 16.509 },
  { character: 'o', startTime: 16.509, endTime: 16.602 },
  { character: ' ', startTime: 16.602, endTime: 16.672 },
  { character: 't', startTime: 16.672, endTime: 16.707 },
  { character: 'o', startTime: 16.707, endTime: 16.742 },
  { character: ' ', startTime: 16.742, endTime: 16.811 },
  { character: 's', startTime: 16.811, endTime: 16.869 },
  { character: 'i', startTime: 16.869, endTime: 16.962 },
  { character: 'g', startTime: 16.962, endTime: 17.02 },
  { character: 'n', startTime: 17.02, endTime: 17.067 },
  { character: ' ', startTime: 17.067, endTime: 17.125 },
  { character: 'u', startTime: 17.125, endTime: 17.194 },
  { character: 'p', startTime: 17.194, endTime: 17.287 },
  { character: '!', startTime: 17.287, endTime: 17.496 },
  { character: ' ', startTime: 17.496, endTime: 18.193 },
  { character: 'I', startTime: 18.193, endTime: 18.239 },
  { character: ' ', startTime: 18.239, endTime: 18.332 },
  { character: 'c', startTime: 18.332, endTime: 18.379 },
  { character: 'a', startTime: 18.379, endTime: 18.448 },
  { character: 'n', startTime: 18.448, endTime: 18.495 },
  { character: "'", startTime: 18.495, endTime: 18.53 },
  { character: 't', startTime: 18.53, endTime: 18.564 },
  { character: ' ', startTime: 18.564, endTime: 18.599 },
  { character: 's', startTime: 18.599, endTime: 18.634 },
  { character: 't', startTime: 18.634, endTime: 18.692 },
  { character: 'o', startTime: 18.692, endTime: 18.762 },
  { character: 'p', startTime: 18.762, endTime: 18.831 },
  { character: ' ', startTime: 18.831, endTime: 18.913 },
  { character: 'g', startTime: 18.913, endTime: 18.971 },
  { character: 'e', startTime: 18.971, endTime: 19.04 },
  { character: 'n', startTime: 19.04, endTime: 19.087 },
  { character: 'n', startTime: 19.087, endTime: 19.11 },
  { character: 'i', startTime: 19.11, endTime: 19.156 },
  { character: 'n', startTime: 19.156, endTime: 19.191 },
  { character: 'g', startTime: 19.191, endTime: 19.214 },
  { character: ' ', startTime: 19.214, endTime: 19.261 },
  { character: 't', startTime: 19.261, endTime: 19.284 },
  { character: 'h', startTime: 19.284, endTime: 19.307 },
  { character: 'e', startTime: 19.307, endTime: 19.365 },
  { character: 's', startTime: 19.365, endTime: 19.412 },
  { character: 'e', startTime: 19.412, endTime: 19.447 },
  { character: ' ', startTime: 19.447, endTime: 19.505 },
  { character: 'v', startTime: 19.505, endTime: 19.574 },
  { character: 'i', startTime: 19.574, endTime: 19.691 },
  { character: 'd', startTime: 19.691, endTime: 19.76 },
  { character: 's', startTime: 19.76, endTime: 19.818 },
  { character: ' ', startTime: 19.818, endTime: 19.853 },
  { character: 'i', startTime: 19.853, endTime: 19.888 },
  { character: 't', startTime: 19.888, endTime: 19.923 },
  { character: ' ', startTime: 19.923, endTime: 19.969 },
  { character: 'f', startTime: 19.969, endTime: 20.016 },
  { character: 'e', startTime: 20.016, endTime: 20.074 },
  { character: 'e', startTime: 20.074, endTime: 20.12 },
  { character: 'l', startTime: 20.12, endTime: 20.178 },
  { character: 's', startTime: 20.178, endTime: 20.225 },
  { character: ' ', startTime: 20.225, endTime: 20.271 },
  { character: 's', startTime: 20.271, endTime: 20.329 },
  { character: 'o', startTime: 20.329, endTime: 20.445 },
  { character: ' ', startTime: 20.445, endTime: 20.526 },
  { character: 'g', startTime: 20.526, endTime: 20.573 },
  { character: 'o', startTime: 20.573, endTime: 20.654 },
  { character: 'o', startTime: 20.654, endTime: 20.724 },
  { character: 'd', startTime: 20.724, endTime: 20.84 },
  { character: '.', startTime: 20.84, endTime: 20.956 },
  { character: '.', startTime: 20.956, endTime: 21.223 },
]

const baseFootageToUrl: {
  [key in BaseFootage]: string;
} = {
  slime: "https://storage.googleapis.com/vidgen-footage/slime.mp4",
  minecraft: "https://storage.googleapis.com/vidgen-footage/minecraft.mp4",
  subwaysurfer:
    "https://storage.googleapis.com/vidgen-footage/subwaysurfers.mp4"
};

export const videoRouter = createTRPCRouter({
  getVideoProgress: protectedProcedure.query(async ({ ctx }) => {
    const latestVideo = (
      await ctx.db
        .selectDistinct()
        .from(videos)
        .where(
          and(
            eq(videos.userId, ctx.session.user.id),
            eq(videos.isComplete, 0)
          ),
        )
        .orderBy(desc(videos.createdAt))
        .limit(1)
    )[0];

    if (!latestVideo) {
      return {
        progress: 0,
        step: 0
      };
    }

    return {
      step: latestVideo.step,
    }
  }),
  completeVideoGeneration: protectedProcedure.mutation(async ({ ctx }) => {
    const latestVideo = (
      await ctx.db
        .selectDistinct()
        .from(videos)
        .where(
          and(
            eq(videos.userId, ctx.session.user.id),
            eq(videos.isComplete, 0)
          ),
        )
        .orderBy(desc(videos.createdAt))
        .limit(1)
    )[0];

    if (!latestVideo) {
      throw new Error("No video found");
    }

    await ctx.db
      .update(videos)
      .set({ isComplete: 1 })
      .where(eq(videos.id, latestVideo.id));

    return true;
  }),
  generateVideo: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(5000),
        voiceId: z.string(),
        wordsPerCaption: z.number().int().min(1).max(15),
        fontSize: z.number().int().min(1).max(100),
        font: z.custom<Font>(),
        fontColor: z.string().min(1).max(7),
        backgroundColor: z.string().min(1).max(7),
        baseFootage: z.custom<BaseFootage>(),
        showBackground: z.boolean(),
        textBorderColor: z.string().min(1).max(7),
        textBorderSize: z.number().int().min(1).max(10),
        showBorder: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tokens = encode(input.text).length;

        const userTokens =
          (
            await ctx.db
              .select()
              .from(users)
              .where(eq(users.id, ctx.session?.user.id ?? ""))
          )?.[0]?.tokens ?? 0;

        if (userTokens < tokens) {
          throw new Error("Not enough tokens");
        }

        // Deduct tokens from user
        const newTokens = userTokens - tokens;


        const encryptedKey = (
          await ctx.db
            .select({
              apiKey: users.encrytedElevenLabsApiKey,
            })
            .from(users)
            .where(eq(users.id, ctx.session.user.id))
        )[0]?.apiKey;

        if (!encryptedKey) {
          throw new Error("No API key found");
        }

        const videoId =
          (
            await ctx.db
              .insert(videos)
              .values({
                userId: ctx.session.user.id,
                createdAt: new Date(),
                step: 1,
              })
              .$returningId()
          )[0]?.id ?? "";

        const apiKey = decryptAPIKey(encryptedKey);
        const { audioBase64, characterStartAndEndTimes } =
          await getElevenLabsTextToSpeechData(
            input.text,
            input.voiceId,
            apiKey,
          )

        if (audioBase64 && characterStartAndEndTimes) {
          await ctx.db
            .update(videos)
            .set({ step: 2 })
            .where(eq(videos.id, videoId));
        }

        for (const character of characterEndTimes) {
          console.log(character)
        }
        // const audioBase64 = ""

        const textFilters = await getFfmpegVideoTextFilters(
          characterStartAndEndTimes,
          input.wordsPerCaption,
          input.fontSize,
          input.fontColor,
          input.font,
          input.backgroundColor,
          input.showBackground,
          input.textBorderColor,
          input.textBorderSize,
          input.showBorder,
        );
        console.log("Text filters processed:", textFilters);

        const footageUrl = baseFootageToUrl[input.baseFootage];
        const videoLength = characterStartAndEndTimes.reduce(
          (acc, { endTime }) => Math.max(acc, endTime),
          0,
        );
        // const videoLength = 6.316;
        const video = await generateVideoCloudFn(
          audioBase64,
          textFilters,
          footageUrl,
          videoLength,
          fontToFontUrl[input.font],
        );

        if (video.error) {
          console.error("Google Cloud Error:", video.error);
        }

        if (video.videoUrl) {
          console.log(video.videoUrl.slice(0, 100), "..." + video.videoUrl.slice(-100));
          const fileName = uuidv4() + ".mp4";
          const fileUrl = `https://storage.googleapis.com/${GC_VIDEO_BUCKET_NAME}/${fileName}`;

          await uploadFileToGCS(video.videoUrl, fileName);
          await ctx.db
            .update(videos)
            .set({ step: 3, url: fileUrl })
            .where(eq(videos.id, videoId))

          await ctx.db
            .update(users)
            .set({
              tokens: newTokens,
            })
            .where(eq(users.id, ctx.session.user.id));

          return {
            videoUrl: fileUrl,
          };
        }

        if (video.error) {
          throw new Error(video.error);
        }

      } catch (error) {
        console.error(error)
        throw new Error("Failed to generate video: " + `${error as string}`);
      }
    }),
});
