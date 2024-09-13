import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import bcrypt from "bcrypt";
import { encryptApiKey } from "~/server/lib/video";

export const userRouter = createTRPCRouter({
  updateApiKey: protectedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { apiKey } = input;
      const encryptedApiKey = encryptApiKey(apiKey);
      await ctx.db
        .update(users)
        .set({ encrytedElevenLabsApiKey: encryptedApiKey })
        .where(eq(users.id, ctx.session.user.id));
    }),
  createAccount: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(3),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email, name, password } = input;
      const existingUserFromEmail = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUserFromEmail.length > 0) {
        throw new Error("Email is already in use");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await ctx.db.insert(users).values({
        email,
        name,
        hashedPassword,
      });
      return user;
    }),
  getUserTokens: protectedProcedure.query(async ({ ctx }) => {
    const userTokens =
      (
        await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, ctx.session?.user.id ?? ""))
      )?.[0]?.tokens || 0;

    return userTokens;
  }),
});
