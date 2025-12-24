"use client";

import { GithubLogo, GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  isLoading?: boolean;
}

export function SocialAuthButtons({ isLoading }: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        className="h-11"
        onClick={() => {
          // Handle Google auth
          console.log("Google auth");
        }}
      >
        <GoogleLogo className="size-5" weight="bold" />
        <span>Google</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        className="h-11"
        onClick={() => {
          // Handle GitHub auth
          console.log("GitHub auth");
        }}
      >
        <GithubLogo className="size-5" weight="bold" />
        <span>GitHub</span>
      </Button>
    </div>
  );
}
