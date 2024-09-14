import { Button } from "~/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { getProviders, signIn } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { type BuiltInProviderType } from "next-auth/providers/index";
import { useRouter } from "next/navigation";

export const providerData = {
  discord: {
    icon: <FaDiscord size="20" />,
    color: "indigo",
  },
  google: {
    icon: <FcGoogle size="20" />,
    color: "red",
  },
};

export function SignInProviders() {
  const { data } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });

  return (
    <div className="mt-6 w-full">
      {/* <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-800">
            continue with
          </span>
        </div>
      </div> */}

      <div className="flex w-full flex-wrap justify-center gap-2 sm:flex-nowrap">
        {(Object.keys(data ?? {}) as BuiltInProviderType[]).map(
          (provider) =>
            provider !== "credentials" && (
              <ProviderSigninButton
                key={provider}
                {...providerData[provider as keyof typeof providerData]}
                provider={provider}
              />
            ),
        )}
      </div>
    </div>
  );
}

interface ProviderSigninButtonProps {
  icon?: React.ReactNode;
  provider: BuiltInProviderType;
  color?: string;
}

export function ProviderSigninButton({
  icon,
  provider,
  color,
}: ProviderSigninButtonProps) {
  const router = useRouter();

  const handleSignIn = async (provider: BuiltInProviderType) => {
    void signIn(provider).then(() => {
      router.push("/");
    });
  };

  return (
    <Button
      variant="outline"
      className="flex items-center justify-center gap-2"
      color={color}
      onClick={() => handleSignIn(provider)}
    >
      {icon} Sign in with {provider}
    </Button>
  );
}
