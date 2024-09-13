"use client";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { type Pack } from "./pack-content";
import { useSession } from "next-auth/react";

export function PaymentButton({
  children,
  pack,
}: {
  pack: Pack;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const session = useSession();
  const { mutate } = api.payment.startPayment.useMutation({
    onSuccess: (data) => {
      const clientSecret = data.clientSecret;
      if (clientSecret) {
        localStorage.setItem("clientSecret", clientSecret);
        router.push("/payment?pack=" + pack);
      }
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleStartPayment = async () => {
    if (session.status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    mutate({
      amount: 100,
      currency: "usd",
    });
  };

  return (
    <Button
      className="w-full bg-red-600 text-white hover:bg-red-500"
      onClick={handleStartPayment}
    >
      {children}
    </Button>
  );
}
