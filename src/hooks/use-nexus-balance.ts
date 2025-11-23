import { useState, useEffect } from "react";
import { NexusSDK } from "@avail-project/nexus-core";
import { usePrivyAuth } from "./use-privy-auth";
import { useWallets } from "@privy-io/react-auth";

export interface ChainBalance {
  chainId: string;
  chainName: string;
  amount: string;
  formattedAmount: string;
}

export interface UnifiedUSDCBalance {
  total: string;
  formattedTotal: string;
  byChain: ChainBalance[];
  isLoading: boolean;
  error: string | null;
}

const CHAIN_NAMES: Record<string, string> = {
  "11155420": "Optimism Sepolia",
  "80002": "Polygon Amoy",
  "421614": "Arbitrum Sepolia",
  "84532": "Base Sepolia",
  "11155111": "Sepolia",
  "10143": "Monad Testnet",
};

export function useNexusBalance() {
  const { walletAddress, authenticated } = usePrivyAuth();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<UnifiedUSDCBalance>({
    total: "0",
    formattedTotal: "0.00",
    byChain: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!authenticated || !walletAddress || wallets.length === 0) {
      console.log("[Nexus] Skipping fetch - authenticated:", authenticated, "walletAddress:", walletAddress, "wallets:", wallets.length);
      setBalance({
        total: "0",
        formattedTotal: "0.00",
        byChain: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    const fetchBalance = async () => {
      setBalance((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log("[Nexus] Starting balance fetch...");
        console.log("[Nexus] Wallet address:", walletAddress);
        console.log("[Nexus] Available wallets:", wallets.length);

        // Get the first wallet (could be embedded or external)
        const activeWallet = wallets[0];
        console.log("[Nexus] Using wallet type:", activeWallet.walletClientType);

        // Get Ethereum provider from the wallet
        console.log("[Nexus] Getting provider from wallet...");
        const provider = await activeWallet.getEthereumProvider();

        if (!provider) {
          console.error("[Nexus] Failed to get provider from wallet");
          setBalance({
            total: "0",
            formattedTotal: "0.00",
            byChain: [],
            isLoading: false,
            error: "No wallet provider",
          });
          return;
        }

        console.log("[Nexus] Wallet provider obtained successfully");

        // Nexus SDK requires SIWE auth on mainnet (chainId 1)
        // Switch to mainnet first for authentication
        const currentChain = await provider.request({ method: "eth_chainId" });
        console.log("[Nexus] Current chain:", currentChain);

        if (currentChain !== "0x1") {
          console.log("[Nexus] Switching to mainnet for SIWE auth...");
          try {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x1" }], // Ethereum mainnet
            });
            console.log("[Nexus] Switched to mainnet");
          } catch (switchError) {
            console.log("[Nexus] Failed to switch to mainnet:", switchError);
            // Continue anyway
          }
        }

        // Initialize SDK with testnet
        console.log("[Nexus] Initializing SDK with testnet config...");
        const sdk = new NexusSDK({ network: "testnet" });

        // Initialize SDK with provider
        console.log("[Nexus] Initializing SDK with provider...");
        await sdk.initialize(provider);

        if (!sdk.isInitialized()) {
          console.error("[Nexus] SDK failed to initialize");
          setBalance({
            total: "0",
            formattedTotal: "0.00",
            byChain: [],
            isLoading: false,
            error: "SDK initialization failed",
          });
          return;
        }

        console.log("[Nexus] SDK initialized successfully");

        // Get unified USDC balance
        console.log("[Nexus] Fetching USDC balance...");
        const usdcBalance = await sdk.getUnifiedBalance("USDC");
        console.log("[Nexus] Raw balance response:", usdcBalance);
        console.log("[Nexus] Response keys:", usdcBalance ? Object.keys(usdcBalance) : "null");

        if (!usdcBalance) {
          setBalance({
            total: "0",
            formattedTotal: "0.00",
            byChain: [],
            isLoading: false,
            error: null,
          });
          return;
        }

        // Parse balances by chain using the breakdown array
        const chainBalances: ChainBalance[] = [];
        let totalAmount = 0;

        console.log("[Nexus] Parsing balance breakdown...");
        console.log("[Nexus] Has breakdown?", !!usdcBalance.breakdown);
        console.log("[Nexus] Is array?", Array.isArray(usdcBalance.breakdown));

        // The SDK returns balance data with breakdown by chain
        if (usdcBalance.breakdown && Array.isArray(usdcBalance.breakdown)) {
          console.log("[Nexus] Number of chains:", usdcBalance.breakdown.length);

          usdcBalance.breakdown.forEach((chainData, index) => {
            console.log(`[Nexus] Chain ${index}:`, {
              chainId: chainData.chain.id,
              chainName: chainData.chain.name,
              balance: chainData.balance,
              decimals: chainData.decimals,
            });

            // Nexus SDK already returns human-readable balances, no need to divide by decimals
            const amount = parseFloat(chainData.balance || "0");
            totalAmount += amount;

            chainBalances.push({
              chainId: chainData.chain.id.toString(),
              chainName: CHAIN_NAMES[chainData.chain.id.toString()] || chainData.chain.name,
              amount: chainData.balance || "0",
              formattedAmount: amount.toFixed(2),
            });
          });
        } else {
          console.warn("[Nexus] No breakdown array found in response");
        }

        console.log("[Nexus] Final balance:", {
          total: totalAmount,
          formattedTotal: totalAmount.toFixed(2),
          chainCount: chainBalances.length,
        });

        const newBalance = {
          total: totalAmount.toString(),
          formattedTotal: totalAmount.toFixed(2),
          byChain: chainBalances,
          isLoading: false,
          error: null,
        };

        console.log("[Nexus] Setting balance state:", newBalance);
        setBalance(newBalance);
        console.log("[Nexus] Balance state updated successfully");
      } catch (error: any) {
        console.error("[Nexus] Error fetching balance:", error);
        console.error("[Nexus] Error stack:", error.stack);
        setBalance((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Failed to fetch balance",
        }));
      }
    };

    fetchBalance();
  }, [authenticated, walletAddress, wallets]);

  return balance;
}
