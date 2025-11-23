"use client";

import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { useNexusBalance } from "@/hooks/use-nexus-balance";
import { Logo } from "@/components/branding/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const { authenticated, user, logout, ready } = usePrivyAuth();
  const router = useRouter();
  const usdcBalance = useNexusBalance();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.push("/");
      return;
    }

    const fetchUserProfile = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("privy_id", user?.id)
        .single();

      console.log("Dashboard: fetching user with privy_id:", user?.id);
      console.log("Dashboard: query result:", { data, error });

      if (error || !data) {
        console.log("Dashboard: User not found, redirecting to onboarding");
        // User profile doesn't exist, redirect to onboarding
        router.push("/onboarding");
        return;
      }

      console.log("Dashboard: User found:", data);
      setUserProfile(data);
      setLoading(false);

      // Fetch user's groups
      fetchUserGroups(data.id);
    };

    const fetchUserGroups = async (userId: string) => {
      setGroupsLoading(true);
      const supabase = createClient();

      const { data: groupsData, error: groupsError } = await supabase
        .from("group_members")
        .select(`
          group_id,
          role,
          groups (
            id,
            name,
            description,
            created_at
          )
        `)
        .eq("user_id", userId);

      if (groupsError) {
        console.error("Error fetching groups:", groupsError);
      } else {
        console.log("Groups:", groupsData);
        // Sort groups by created_at descending (newest first)
        const sortedGroups = (groupsData || []).sort((a: any, b: any) => {
          return new Date(b.groups.created_at).getTime() - new Date(a.groups.created_at).getTime();
        });
        setGroups(sortedGroups);
      }

      setGroupsLoading(false);
    };

    fetchUserProfile();
  }, [authenticated, user, router, ready]);

  const handleRefreshGroups = () => {
    if (userProfile?.id) {
      const fetchUserGroups = async (userId: string) => {
        setGroupsLoading(true);
        const supabase = createClient();

        const { data: groupsData, error: groupsError } = await supabase
          .from("group_members")
          .select(`
            group_id,
            role,
            groups (
              id,
              name,
              description,
              created_at
            )
          `)
          .eq("user_id", userId);

        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
        } else {
          console.log("Groups:", groupsData);
          // Sort groups by created_at descending (newest first)
          const sortedGroups = (groupsData || []).sort((a: any, b: any) => {
            return new Date(b.groups.created_at).getTime() - new Date(a.groups.created_at).getTime();
          });
          setGroups(sortedGroups);
        }

        setGroupsLoading(false);
      };

      fetchUserGroups(userProfile.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-200 p-4">
        <header className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
          <Logo size="sm" />
        </header>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            <p className="text-center text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-200 p-4">
      {/* Header */}
      <header className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <Logo size="sm" />
            <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">@{userProfile?.username}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="border-2 border-black rounded-lg font-bold"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <h2 className="text-4xl font-heading font-black mb-4">
            Welcome, {userProfile?.username}! 👋
          </h2>
          <p className="text-xl mb-6">Ready to split some bills?</p>

          {/* User info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-pink-100 border-2 border-black rounded-lg">
              <p className="text-sm font-bold text-gray-600">ENS Name</p>
              <p className="text-lg font-bold">{userProfile?.ens_name}</p>
            </div>
            <div className="p-4 bg-blue-100 border-2 border-black rounded-lg">
              <p className="text-sm font-bold text-gray-600">Wallet Address</p>
              <p className="text-sm font-mono break-all">{userProfile?.wallet_address}</p>
            </div>
            <div className="p-4 bg-yellow-100 border-2 border-black rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-gray-600">USDC Balance</p>
                  {usdcBalance.isLoading ? (
                    <p className="text-lg font-bold text-gray-500">Loading...</p>
                  ) : usdcBalance.error ? (
                    <p className="text-sm text-red-600">{usdcBalance.error}</p>
                  ) : (
                    <p className="text-2xl font-bold">${usdcBalance.formattedTotal}</p>
                  )}
                </div>
                {!usdcBalance.isLoading && !usdcBalance.error && usdcBalance.byChain.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-black rounded-lg font-bold text-xs"
                      >
                        By Chain ▾
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 border-2 border-black rounded-lg">
                      <DropdownMenuLabel>Balance Distribution</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {usdcBalance.byChain.map((chain) => (
                        <DropdownMenuItem key={chain.chainId} className="flex justify-between">
                          <span className="font-medium">{chain.chainName}</span>
                          <span className="font-bold">${chain.formattedAmount}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${usdcBalance.formattedTotal}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Groups section */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-heading font-black">YOUR GROUPS</h3>
            <CreateGroupDialog onGroupCreated={handleRefreshGroups} />
          </div>

          {groupsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl font-bold mb-2">No groups yet</p>
              <p>Create a group to start splitting expenses with friends!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups.map((groupMember: any) => (
                <div
                  key={groupMember.group_id}
                  className="p-6 border-4 border-black rounded-xl bg-gradient-to-r from-pink-100 to-yellow-100 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/groups/${groupMember.group_id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold mb-1">{groupMember.groups.name}</h4>
                      {groupMember.groups.description && (
                        <p className="text-gray-600 text-sm">{groupMember.groups.description}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-yellow-400 border-2 border-black rounded-lg text-xs font-bold">
                      {groupMember.role === "admin" ? "CREATOR" : "MEMBER"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
