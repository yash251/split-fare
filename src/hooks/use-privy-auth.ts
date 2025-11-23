"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export function usePrivyAuth() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout: privyLogout,
    linkEmail,
    linkGoogle,
    linkTwitter,
  } = usePrivy();

  const logout = async () => {
    await privyLogout();
    window.location.href = "/";
  };

  const { wallets } = useWallets();
  const [embeddedWallet, setEmbeddedWallet] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (wallets.length > 0) {
      // Get the embedded wallet (first wallet created by Privy)
      const embedded = wallets.find((wallet) => wallet.walletClientType === "privy");
      setEmbeddedWallet(embedded);

      // Get wallet address from any wallet (embedded or external)
      const firstWallet = wallets[0];
      setWalletAddress(firstWallet?.address);
    }
  }, [wallets]);

  return {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkEmail,
    linkGoogle,
    linkTwitter,
    embeddedWallet,
    walletAddress,
  };
}
