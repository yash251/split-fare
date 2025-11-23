"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNexusBalance } from "@/hooks/use-nexus-balance";
import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { useWallets } from "@privy-io/react-auth";
import { NexusSDK } from "@avail-project/nexus-core";
import { createClient } from "@/lib/supabase/client";

interface SettleUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: {
    fromUserId: string;
    fromUsername: string;
    toUserId: string;
    toUsername: string;
    amount: number;
  };
  groupId: string;
  onSettlementComplete?: () => void;
}

export function SettleUpModal({
  open,
  onOpenChange,
  debt,
  groupId,
  onSettlementComplete
}: SettleUpModalProps) {
  const usdcBalance = useNexusBalance();
  const { user } = usePrivyAuth();
  const { wallets } = useWallets();
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const handleSettle = async () => {
    // Validation
    const totalBalance = parseFloat(usdcBalance.formattedTotal);
    if (totalBalance < debt.amount) {
      setError(`Insufficient balance. Need $${debt.amount.toFixed(2)}, have $${totalBalance.toFixed(2)}`);
      return;
    }

    if (!wallets || wallets.length === 0) {
      setError("Wallet not connected");
      return;
    }

    setPaying(true);
    setError("");

    try {
      console.log("[Settlement] Starting payment...");

      // Get recipient wallet
      const supabase = createClient();
      const { data: recipientData } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", debt.toUserId)
        .single();

      if (!recipientData?.wallet_address) {
        throw new Error("Recipient wallet not found");
      }

      console.log("[Settlement] Recipient wallet:", recipientData.wallet_address);

      // Get provider - SDK needs to do SIWE auth on mainnet (chainId 1) first
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();

      console.log("[Settlement] Initializing Nexus SDK...");
      const sdk = new NexusSDK({ network: "testnet" });

      // SDK will prompt for SIWE signature on mainnet (this is expected)
      // Then it will operate on testnet chains
      await sdk.initialize(provider);

      console.log("[Settlement] SDK initialized successfully");

      // Get source chains with USDC > 0
      const chainsWithBalance = usdcBalance.byChain
        .filter(c => parseFloat(c.formattedAmount) > 0);

      const sourceChains = chainsWithBalance.map(c => parseInt(c.chainId));

      // Use the chain with the most USDC as destination
      const destinationChain = chainsWithBalance.sort((a, b) =>
        parseFloat(b.formattedAmount) - parseFloat(a.formattedAmount)
      )[0];

      const destChainId = parseInt(destinationChain.chainId);

      console.log("[Settlement] Transferring from chains:", sourceChains);
      console.log("[Settlement] Destination chain:", destinationChain.chainName, `(${destChainId})`);
      console.log("[Settlement] Transfer params:", {
        token: "USDC",
        amount: debt.amount,
        chainId: destChainId,
        recipient: recipientData.wallet_address,
        sourceChains,
      });

      // Execute transfer with detailed error handling
      try {
        console.log("[Settlement] Calling sdk.transfer()...");
        console.log("[Settlement] Please approve all wallet prompts:");
        console.log("[Settlement] 1. Chain switches (for each source chain)");
        console.log("[Settlement] 2. USDC spending approvals (for each source chain)");
        console.log("[Settlement] 3. Transfer transactions");

        const result = await sdk.transfer({
          token: "USDC",
          amount: debt.amount,
          chainId: destChainId as any, // Dynamic destination chain
          recipient: recipientData.wallet_address as `0x${string}`,
          sourceChains: sourceChains as any[],
        });

        console.log("[Settlement] Transfer result:", result);

        if (!result.success) {
          // Check if it's an allowance issue
          if (result.error?.includes("allowance") || result.error?.includes("ERC20")) {
            throw new Error("USDC spending approval failed. Please approve all wallet prompts and try again.");
          }
          throw new Error(result.error || "Transfer failed");
        }

        // Record settlement
        console.log("[Settlement] Recording settlement in database...");
        const settlementResponse = await fetch("/api/settlements/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            fromUserId: debt.fromUserId,
            toUserId: debt.toUserId,
            amount: debt.amount,
            sourceChainId: destChainId.toString(), // Store destination chain ID where tx happened
            transactionHash: result.transactionHash,
            privyId: user?.id,
          }),
        });

        const settlementData = await settlementResponse.json();
        console.log("[Settlement] Database response:", settlementData);

        if (!settlementResponse.ok) {
          throw new Error(settlementData.error || "Failed to record settlement");
        }

        // Success!
        console.log("[Settlement] Settlement completed successfully!");
        onOpenChange(false);
        if (onSettlementComplete) onSettlementComplete();

      } catch (txError: any) {
        // Handle chain switching errors gracefully
        if (txError.message?.includes("wallet_switchEthereumChain") ||
            txError.message?.includes("already pending")) {
          setError("Please approve all wallet prompts and try again");
        } else {
          throw txError;
        }
      }

    } catch (error: any) {
      console.error("[Settlement] Error:", error);
      setError(error.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-black">
            SETTLE UP
          </DialogTitle>
          <DialogDescription>
            Pay {debt.toUsername} with USDC via Avail Nexus
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Payment Details */}
          <div className="p-4 bg-gray-100 border-2 border-black rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-600">Amount to Pay</span>
              <span className="text-2xl font-bold">${debt.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600">Recipient</span>
              <span className="font-bold">@{debt.toUsername}</span>
            </div>
          </div>

          {/* Your USDC Balance */}
          <div className="p-4 bg-yellow-100 border-2 border-black rounded-lg">
            <p className="text-sm font-bold text-gray-600 mb-2">Your Total USDC Balance</p>
            {usdcBalance.isLoading ? (
              <p className="text-gray-500">Loading balances...</p>
            ) : usdcBalance.error ? (
              <p className="text-red-600 text-sm">{usdcBalance.error}</p>
            ) : (
              <>
                <p className="text-2xl font-bold mb-3">${usdcBalance.formattedTotal}</p>

                {/* Show balance distribution */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-500">Available across chains:</p>
                  {usdcBalance.byChain
                    .filter((chain) => parseFloat(chain.formattedAmount) > 0)
                    .map((chain) => (
                      <div key={chain.chainId} className="flex justify-between text-xs">
                        <span className="text-gray-600">{chain.chainName}</span>
                        <span className="font-bold">${chain.formattedAmount}</span>
                      </div>
                    ))}
                </div>

                {parseFloat(usdcBalance.formattedTotal) < debt.amount && (
                  <p className="text-sm text-red-600 mt-3">
                    Insufficient balance. You need ${debt.amount.toFixed(2)} but only have ${usdcBalance.formattedTotal}.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Avail Nexus</strong> will automatically aggregate USDC from all your chains
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-black rounded-lg font-bold"
              disabled={paying}
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSettle}
              disabled={paying || usdcBalance.isLoading || parseFloat(usdcBalance.formattedTotal) < debt.amount}
              className="flex-1 bg-violet-500 text-white border-2 border-black rounded-lg font-bold hover:bg-violet-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {paying ? "PROCESSING..." : `PAY $${debt.amount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
