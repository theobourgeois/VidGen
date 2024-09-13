import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import Stripe from "stripe";
import { env } from "~/env";
import { payments, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const paymentRouter = createTRPCRouter({
  startPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { amount, currency } = input;

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Stripe expects amount in cents
          currency,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return {
          clientSecret: paymentIntent.client_secret,
        };
      } catch (error) {
        console.error("Error creating PaymentIntent:", error);
        throw new Error("Failed to create PaymentIntent");
      }
    }),
  addTokensToAccount: protectedProcedure
    .input(
      z.object({
        tokens: z.number().positive(),
        paymentIntent: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { tokens } = input;

      const userTokens =
        (
          await ctx.db
            .select()
            .from(users)
            .where(eq(users.id, ctx.session?.user.id ?? ""))
        )?.[0]?.tokens ?? 0;

      const newTokens = userTokens + tokens;

      const newUser = await ctx.db
        .update(users)
        .set({ tokens: newTokens })
        .where(eq(users.id, ctx.session?.user.id ?? ""));

      const payment = await ctx.db.insert(payments).values({
        paymentIntent: input.paymentIntent,
      });

      if (!payment) {
        // Rollback the user update
        await ctx.db
          .update(users)
          .set({ tokens: userTokens })
          .where(eq(users.id, ctx.session?.user.id ?? ""));
        throw new Error("Failed to add payment to database");
      }

      return newUser;
    }),
});
