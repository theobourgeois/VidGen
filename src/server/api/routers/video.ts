import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users, videos } from "~/server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import {
  decryptAPIKey,
  fontToFontUrl,
  generateVideo,
  getElevenLabsTextToSpeechData,
  getFfmpegVideoTextFilters,
} from "~/server/lib/video";
import { encode } from "gpt-tokenizer";
import { type BaseFootage, type Font } from "~/app/create-video/page";

const baseFootageToUrl: {
  [key in BaseFootage]: string;
} = {
  slime: "https://storage.googleapis.com/vidgen-footage/slime.mp4",
  minecraft: "https://storage.googleapis.com/vidgen-footage/minecraft.mp4",
  subwaysurfer:
    "https://storage.googleapis.com/vidgen-footage/subwaysurfers.mp4",
};

export const videoRouter = createTRPCRouter({
  getLatestVideo: protectedProcedure.query(async ({ ctx }) => {
    const latestVideo = (
      await ctx.db
        .select()
        .from(videos)
        .where(eq(videos.userId, ctx.session.user.id))
        .orderBy(desc(videos.createdAt))
        .limit(1)
    )[0];

    if (!latestVideo) {
      return undefined;
    }

    return latestVideo.url;
  }),
  getLatestVideoProgress: protectedProcedure.query(async ({ ctx }) => {
    const latestVideo = (
      await ctx.db
        .selectDistinct()
        .from(videos)
        .where(
          and(eq(videos.userId, ctx.session.user.id), eq(videos.isComplete, 0)),
        )
        .orderBy(desc(videos.createdAt))
        .limit(1)
    )[0];

    if (!latestVideo) {
      return {
        step: 0,
        videoUrl: "",
      };
    }

    return {
      step: latestVideo.step,
      videoUrl: latestVideo.url,
    };
  }),
  completeVideoGeneration: protectedProcedure.mutation(async ({ ctx }) => {
    const latestVideo = (
      await ctx.db
        .selectDistinct()
        .from(videos)
        .where(
          and(eq(videos.userId, ctx.session.user.id), eq(videos.isComplete, 0)),
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
        await getElevenLabsTextToSpeechData(input.text, input.voiceId, apiKey);

      if (audioBase64 && characterStartAndEndTimes) {
        await ctx.db
          .update(videos)
          .set({ step: 2 })
          .where(eq(videos.id, videoId));
      }

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

      const footageUrl = baseFootageToUrl[input.baseFootage];
      const videoLength = characterStartAndEndTimes.reduce(
        (acc, { endTime }) => Math.max(acc, endTime),
        0,
      );
      const video = await generateVideo(
        audioBase64,
        textFilters,
        footageUrl,
        videoLength,
        fontToFontUrl[input.font],
      );

      if (video.error) {
        throw new Error(video.error);
      }

      await ctx.db
        .update(videos)
        .set({ step: 3 })
        .where(eq(videos.id, videoId))
        .catch((error) => {
          console.error(error);
        });

      return {
        videoUrl: video.videoUrl,
      };
    }),
});
