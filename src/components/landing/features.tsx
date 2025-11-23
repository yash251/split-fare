"use client";

import { Dollar } from "@/components/decorations/dollar";
import { Coin } from "@/components/decorations/coin";
import { Bill } from "@/components/decorations/bill";

export function Features() {
  return (
    <>
      {/* How it works - Light Blue Section */}
      <section className="relative bg-blue-200 py-20 overflow-hidden">
        <Coin className="absolute top-10 right-10 w-20 h-20 text-yellow-500 opacity-70" />
        <Dollar className="absolute bottom-10 left-10 w-16 h-16 text-green-500" />

        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-heading font-black text-center mb-12">
            LIKE SPLITWISE,
            <br />BUT WITH CRYPTO.
          </h2>

          <p className="text-xl md:text-2xl text-center max-w-3xl mx-auto">
            Track shared expenses with friends. Add bills from dinners, trips, rent, or utilities.
            SplitFare calculates who owes what, then settle up instantly with USDC across any blockchain.
          </p>
        </div>
      </section>

      {/* Split Bills - White Section */}
      <section className="relative bg-white py-20 overflow-hidden">
        <Bill className="absolute bottom-10 right-10 w-24 h-24 text-violet-500" />

        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-heading font-black text-center mb-6">
            HOW IT WORKS
          </h2>

          <p className="text-lg md:text-xl text-center max-w-2xl mx-auto mb-12">
            Create groups, add expenses, and let SplitFare calculate who owes what.
            Settle with USDC across any blockchain
          </p>

          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto px-4">
            <div className="bg-violet-100 border-4 border-black p-8 rounded-2xl text-center">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-2xl font-bold mb-2">Add Expenses</h3>
              <p>Split equally or customize amounts per person</p>
            </div>

            <div className="bg-yellow-100 border-4 border-black p-8 rounded-2xl text-center">
              <div className="text-4xl mb-4">🧮</div>
              <h3 className="text-2xl font-bold mb-2">Auto-Calculate</h3>
              <p>We simplify debts to minimize transactions</p>
            </div>

            <div className="bg-blue-100 border-4 border-black p-8 rounded-2xl text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2">Settle Up</h3>
              <p>Pay with USDC instantly across any chain</p>
            </div>
          </div>
        </div>
      </section>

      {/* ENS Identity - Yellow Section */}
      <section className="relative bg-yellow-400 py-20 overflow-hidden">
        <Bill className="absolute top-10 left-10 w-28 h-28 text-green-500 opacity-60" />
        <Coin className="absolute bottom-10 right-10 w-24 h-24 text-orange-500 opacity-50" />
        <Dollar className="absolute top-1/2 right-1/4 w-16 h-16 text-violet-500" />

        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-heading font-black text-center mb-6">
            YOUR IDENTITY.
            <br />
            YOUR NAME.
          </h2>

          <p className="text-xl md:text-2xl text-center max-w-3xl mx-auto font-bold">
            Get your own identity
            <br />
            <span className="text-lg font-normal">
              Send money to @alice, not 0x4f3a2b8c...
            </span>
          </p>
        </div>
      </section>

      {/* Security - Purple Section */}
      <section className="relative bg-violet-500 py-20 overflow-hidden">
        <Dollar className="absolute top-10 right-10 w-20 h-20 text-yellow-400" />
        <Coin className="absolute bottom-10 left-10 w-20 h-20 text-yellow-500" />

        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-7xl font-heading font-black text-center text-white mb-12">
            SECURITY. CONTROL. SUPPORT.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold text-white mb-3">TOTAL SECURITY</h3>
              <p className="text-white">
                SplitFare is 100% self-custodial. Every transaction is approved via
                your wallet. No one else can move your assets. Not even us.
              </p>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">🕹️</div>
              <h3 className="text-2xl font-bold text-white mb-3">TRUE CONTROL</h3>
              <p className="text-white">
                You verify your identity only when needed. The rest of the time you
                operate without mandatory KYC or friction.
              </p>
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4">🗣️</div>
              <h3 className="text-2xl font-bold text-white mb-3">24/7 HELP</h3>
              <p className="text-white">
                One tap connects you to real humans. Friendly, expert support is on
                hand day or night to resolve any question instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
