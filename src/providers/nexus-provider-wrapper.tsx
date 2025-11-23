"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { NexusProvider } from "@avail-project/nexus-widgets";

export function NexusProviderWrapper({ children }: { children: React.ReactNode }) {
  const { wallets } = useWallets();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setupProvider = async () => {
      if (wallets.length > 0) {
        const activeWallet = wallets[0];
        const ethProvider = await activeWallet.getEthereumProvider();

        // Inject provider as window.ethereum for Nexus widgets
        if (typeof window !== "undefined") {
          (window as any).ethereum = ethProvider;
          console.log("[Nexus] Injected wallet provider to window.ethereum");
        }

        setIsReady(true);
      } else {
        // No wallets yet, but still show content
        setIsReady(true);
      }
    };

    setupProvider();
  }, [wallets]);

  // Wait for provider injection before rendering NexusProvider
  if (!isReady) {
    return <>{children}</>;
  }

  return (
    <NexusProvider config={{ network: "testnet" }}>
      {children}
    </NexusProvider>
  );
}
