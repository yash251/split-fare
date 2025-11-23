"use client";

import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const { ready, authenticated, login, user } = usePrivyAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!ready || !authenticated || hasChecked.current) return;

    const checkUserProfile = async () => {
      hasChecked.current = true;
      setChecking(true);

      const supabase = createClient();

      // Check if user exists in Supabase
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("privy_id", user?.id)
        .single();

      if (error || !data) {
        // User not found, redirect to onboarding
        router.push("/onboarding");
      } else {
        // User exists, redirect to dashboard
        router.push("/dashboard");
      }
    };

    checkUserProfile();
  }, [authenticated, user, router, ready]);

  if (!ready) {
    return (
      <Button disabled className="bg-gray-400 cursor-not-allowed">
        Loading...
      </Button>
    );
  }

  if (authenticated || checking) {
    return (
      <Button disabled className="bg-gray-400 cursor-not-allowed">
        Redirecting...
      </Button>
    );
  }

  return (
    <Button
      onClick={login}
      className="bg-white text-black border-4 border-black rounded-lg px-12 py-8 text-2xl font-bold hover:bg-yellow-400 hover:scale-105 transition-all duration-200 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
    >
      SIGN UP
    </Button>
  );
}
