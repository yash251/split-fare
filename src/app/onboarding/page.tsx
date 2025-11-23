"use client";

import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const { authenticated, user, walletAddress, ready, logout } = usePrivyAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.push("/");
      return;
    }

    // Pre-fill email if available from Privy
    if (user?.email?.address) {
      setFormData((prev) => ({ ...prev, email: user.email!.address }));
    } else if (user?.google?.email) {
      setFormData((prev) => ({ ...prev, email: user.google!.email }));
    }
  }, [authenticated, user, router, ready]);

  // Check username availability with debounce
  useEffect(() => {
    if (!formData.username || formData.username.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timeoutId = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("username", formData.username)
        .single();

      setUsernameStatus(data ? "taken" : "available");
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Double-check username availability
      if (usernameStatus === "taken") {
        setError("Username already taken. Please choose another.");
        setLoading(false);
        return;
      }

      // Create ENS subdomain via API route
      const ensResponse = await fetch("/api/ens/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          walletAddress,
        }),
      });

      const ensData = await ensResponse.json();

      if (!ensResponse.ok) {
        console.error("ENS creation error:", ensData.error);
        setError(`Failed to create ENS name: ${ensData.error}`);
        setLoading(false);
        return;
      }

      // Create user in Supabase
      const { error } = await supabase.from("users").insert({
        privy_id: user?.id,
        email: formData.email,
        name: formData.name,
        username: formData.username,
        wallet_address: walletAddress,
        ens_name: ensData.ensName,
      });

      if (error) {
        console.error("Error creating user:", error);
        if (error.code === "23505") {
          // Unique constraint violation
          setError("Username already taken. Please choose another.");
        } else {
          setError("Error creating account. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!ready || !authenticated) {
    return (
      <div className="min-h-screen bg-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 max-w-2xl w-full">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-4xl md:text-5xl font-heading font-black">
            WELCOME TO SPLITFARE!
          </h1>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="border-2 border-black rounded-lg font-bold"
          >
            Disconnect
          </Button>
        </div>
        <p className="text-lg mb-8">Let's get you set up in 3 quick steps</p>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div className={`h-2 flex-1 rounded ${step >= 1 ? "bg-pink-500" : "bg-gray-300"}`} />
          <div className={`h-2 flex-1 rounded ${step >= 2 ? "bg-pink-500" : "bg-gray-300"}`} />
          <div className={`h-2 flex-1 rounded ${step >= 3 ? "bg-pink-500" : "bg-gray-300"}`} />
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-2">What's your name?</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-xl py-6 border-4 border-black rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                You can use a pseudonym if you prefer
              </p>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="w-full bg-pink-500 text-white border-4 border-black rounded-lg py-6 text-xl font-bold hover:bg-pink-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              NEXT
            </Button>
          </div>
        )}

        {/* Step 2: Email */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="vitalik@ethereum.org"
                value={formData.email}
                onChange={(e) => {
                  const email = e.target.value;
                  setFormData({ ...formData, email });

                  // Validate email on change
                  if (email && !isValidEmail(email)) {
                    setEmailError("Please enter a valid email address");
                  } else {
                    setEmailError("");
                  }
                }}
                className={`text-xl py-6 border-4 rounded-lg ${
                  emailError ? "border-red-500" : "border-black"
                }`}
                disabled={!!user?.email?.address || !!user?.google?.email}
              />
              {emailError && (
                <p className="text-sm text-red-500 mt-2 font-bold">{emailError}</p>
              )}
              {!emailError && (user?.email?.address || user?.google?.email) ? (
                <p className="text-sm text-gray-600 mt-2">Email from your login method</p>
              ) : !emailError && (
                <p className="text-sm text-gray-600 mt-2">
                  We take this only for notifications. We won't spam, pinky promise! 🤝
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 border-4 border-black rounded-lg py-6 text-xl font-bold"
              >
                BACK
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.email || !isValidEmail(formData.email)}
                className="flex-1 bg-pink-500 text-white border-4 border-black rounded-lg py-6 text-xl font-bold hover:bg-pink-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                NEXT
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Username */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold mb-2">Choose your username</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="alice"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                    });
                    setError("");
                  }}
                  className="text-xl py-6 border-4 border-black rounded-lg pr-48"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  .splitfare.eth
                </span>
              </div>
              {usernameStatus === "taken" && (
                <p className="text-sm text-red-500 mt-2 font-bold">
                  Username already taken. Try another!
                </p>
              )}
              {usernameStatus === "available" && (
                <p className="text-sm text-green-600 mt-2 font-bold">
                  Username available! 🎉
                </p>
              )}
              {usernameStatus === "idle" && (
                <p className="text-sm text-gray-600 mt-2">
                  This will be your identity on SplitFare. Friends can send you money using @
                  {formData.username || "username"}
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-100 border-2 border-red-500 rounded-lg">
                <p className="text-red-700 font-bold">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 border-4 border-black rounded-lg py-6 text-xl font-bold"
              >
                BACK
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.username || usernameStatus !== "available" || loading}
                className="flex-1 bg-yellow-400 text-black border-4 border-black rounded-lg py-6 text-xl font-bold hover:bg-yellow-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "CREATING..." : "GET STARTED! 🚀"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
