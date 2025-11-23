"use client";

import { Dollar } from "@/components/decorations/dollar";
import { Coin } from "@/components/decorations/coin";
import { Bill } from "@/components/decorations/bill";
import { LoginButton } from "@/components/auth/login-button";
import { Logo } from "@/components/branding/logo";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-violet-500 overflow-hidden flex items-center justify-center">
      {/* Decorative elements */}
      <Coin className="absolute top-20 left-10 w-24 h-24 text-yellow-400" />
      <Bill className="absolute bottom-32 right-20 w-32 h-32 text-green-400 opacity-80" />
      <Dollar className="absolute top-32 right-10 w-20 h-20 text-yellow-300" />
      <Bill className="absolute bottom-20 left-10 w-24 h-24 text-emerald-400 opacity-70" />

      <div className="container mx-auto px-4 py-20 z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 animate-pulse"></div>
              {/* Logo card */}
              <div className="relative bg-white/60 backdrop-blur-md px-6 py-4 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:scale-105">
                <Logo size="lg" className="text-black" />
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black text-white mb-0 leading-tight">
            <span className="inline-block transform -rotate-2">SPLIT</span>{" "}
            <span className="inline-block transform rotate-1">BILLS</span>
          </h1>

          {/* Bubble text effect */}
          <div className="relative inline-block mb-6">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white stroke-text relative z-10">
              SETTLE INSTANTLY
            </h2>
          </div>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-black font-bold mb-3">
            TRACK EXPENSES · SPLIT FAIRLY · PAY WITH CRYPTO
          </p>

          {/* Arrows pointing to CTA */}
          <div className="flex justify-center items-center gap-8 mb-0">
            {/* Left curved arrow */}
            <svg
              className="w-16 h-16 md:w-20 md:h-20 text-black"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            >
              <path d="M 20 10 Q 40 30 50 70" />
              <path d="M 50 70 L 40 60" />
              <path d="M 50 70 L 60 60" />
            </svg>
            {/* Right curved arrow */}
            <svg
              className="w-16 h-16 md:w-20 md:h-20 text-black"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            >
              <path d="M 80 10 Q 60 30 50 70" />
              <path d="M 50 70 L 40 60" />
              <path d="M 50 70 L 60 60" />
            </svg>
          </div>

          {/* CTA Button */}
          <LoginButton />

          <p className="mt-4 text-sm italic text-black">takes 30 seconds</p>
        </div>
      </div>
    </section>
  );
}
