"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { LogOut, Key } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "~/trpc/react";

interface UserAvatarProps {
  name: string;
  email: string;
}

export default function UserAvatar({ name, email }: UserAvatarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const tokensRemaining = api.user.getUserTokens.useQuery().data ?? 0;

  const handleLogout = () => {
    signOut()
      .then(() => {
        router.push("/auth/signin");
        router.refresh();
      })
      .catch((error) => {
        console.error("Error signing out", error);
      });
  };

  const handleClickBuyMoreTokens = () => {
    router.push("/pricing");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex justify-between">
          <div className="flex items-center justify-start space-x-2">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{name}</h4>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
          <Link title="Change API Key" href="/change-api-key">
            <Key className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          </Link>
        </div>
        <div className="mt-4 flex flex-col space-y-1">
          <span className="text-sm text-gray-500">
            {Intl.NumberFormat().format(tokensRemaining)} tokens left
          </span>
          <Button
            onClick={handleClickBuyMoreTokens}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            Buy more tokens
          </Button>
        </div>
        <div className="mt-4 border-t pt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
