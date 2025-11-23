"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia, sepolia, optimismSepolia, arbitrumSepolia } from "viem/chains";
import { NexusProviderWrapper } from "./nexus-provider-wrapper";

// Define Polygon Amoy and Monad testnet
const polygonAmoy = {
  id: 80002,
  name: "Polygon Amoy",
  network: "polygon-amoy",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-amoy.polygon.technology"] },
    public: { http: ["https://rpc-amoy.polygon.technology"] },
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://amoy.polygonscan.com" },
  },
  testnet: true,
} as const;

const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.monad.xyz"] },
    public: { http: ["https://testnet.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Explorer", url: "https://explorer.testnet.monad.xyz" },
  },
  testnet: true,
} as const;

// Create Wagmi config for Nexus chains
export const wagmiConfig = createConfig({
  chains: [baseSepolia, sepolia, optimismSepolia, arbitrumSepolia, polygonAmoy, monadTestnet],
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [monadTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "google", "twitter", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#8B5CF6",
          logo: "/icons/icon-192x192.png",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          showWalletUIs: true,
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia, sepolia, optimismSepolia, arbitrumSepolia, polygonAmoy, monadTestnet],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <NexusProviderWrapper>
            {children}
          </NexusProviderWrapper>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
