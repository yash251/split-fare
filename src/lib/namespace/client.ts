import { createOffchainClient, ChainName } from "@thenamespace/offchain-manager";

export async function createENSSubdomain({
  username,
  walletAddress,
}: {
  username: string;
  walletAddress: string;
}) {
  const apiKey = process.env.NAMESPACE_API_KEY;
  const parentName = process.env.NEXT_PUBLIC_ENS_DOMAIN || "splitfare.eth";

  if (!apiKey) {
    throw new Error("NAMESPACE_API_KEY not configured");
  }

  const client = createOffchainClient({
    mode: "sepolia",
    defaultApiKey: apiKey,
  });

  try {
    // Create the subdomain (e.g., alice.splitfare.eth)
    const result = await client.createSubname({
      label: username,
      parentName,
      addresses: [
        {
          chain: ChainName.Ethereum,
          value: walletAddress,
        },
      ],
      texts: [
        {
          key: "name",
          value: username,
        },
        {
          key: "description",
          value: "SplitFare user",
        },
      ],
    });

    return {
      success: true,
      ensName: `${username}.${parentName}`,
      data: result,
    };
  } catch (error: any) {
    console.error("ENS subdomain creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create ENS subdomain",
    };
  }
}
