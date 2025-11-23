"use client";

import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { InviteLinkDialog } from "@/components/groups/invite-link-dialog";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { SettleUpModal } from "@/components/settlements/settle-up-modal";
import { Logo } from "@/components/branding/logo";

// Helper function to get block explorer URL for a given chain
function getExplorerUrl(chainId: string, txHash: string): string {
  // Handle comma-separated chain IDs (old format) - take the first one
  const actualChainId = chainId.includes(",") ? chainId.split(",")[0] : chainId;

  const explorers: Record<string, string> = {
    "84532": `https://sepolia.basescan.org/tx/${txHash}`, // Base Sepolia
    "11155111": `https://sepolia.etherscan.io/tx/${txHash}`, // Ethereum Sepolia
    "11155420": `https://sepolia-optimism.etherscan.io/tx/${txHash}`, // OP Sepolia
    "421614": `https://sepolia.arbiscan.io/tx/${txHash}`, // Arbitrum Sepolia
    "80002": `https://amoy.polygonscan.com/tx/${txHash}`, // Polygon Amoy
    "10143": `https://testnet.monadexplorer.com/tx/${txHash}`, // Monad Testnet
  };

  console.log("[Explorer] Looking up chain:", actualChainId, "from input:", chainId);
  return explorers[actualChainId] || `https://etherscan.io/tx/${txHash}`;
}

export default function GroupDetailPage() {
  const { authenticated, user, ready } = usePrivyAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.push("/");
      return;
    }

    const fetchGroupData = async () => {
      const supabase = createClient();

      // Fetch current user's profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("privy_id", user?.id)
        .single();

      if (userError || !userData) {
        console.error("Error fetching user profile:", userError);
        router.push("/dashboard");
        return;
      }

      setUserProfile(userData);

      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError || !groupData) {
        console.error("Error fetching group:", groupError);
        router.push("/dashboard");
        return;
      }

      setGroup(groupData);

      // Fetch group members
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select(`
          *,
          users (
            id,
            name,
            username,
            ens_name,
            wallet_address
          )
        `)
        .eq("group_id", groupId);

      if (membersError) {
        console.error("Error fetching members:", membersError);
      } else {
        setMembers(membersData || []);
      }

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select(`
          *,
          paid_by_user:users!expenses_paid_by_fkey (
            id,
            name,
            username
          ),
          expense_splits (
            user_id,
            amount
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError);
      } else {
        setExpenses(expensesData || []);
      }

      // Fetch settlements (only if table exists - will be created via migration)
      let settlementsData: any[] = [];
      try {
        console.log("[Page] Fetching settlements for group:", groupId);

        // Check if user is authenticated with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[Page] Supabase session:", session ? "authenticated" : "not authenticated");
        console.log("[Page] User ID:", session?.user?.id);

        const { data, error: settlementsError } = await supabase
          .from("settlements")
          .select(`
            *,
            from_user:users!settlements_from_user_id_fkey (
              id,
              name,
              username
            ),
            to_user:users!settlements_to_user_id_fkey (
              id,
              name,
              username
            )
          `)
          .eq("group_id", groupId)
          .order("created_at", { ascending: false });

        console.log("[Page] Settlements fetch result:", { data, error: settlementsError, count: data?.length });

        if (settlementsError) {
          console.warn("Settlements error:", settlementsError);
          setSettlements([]);
        } else {
          settlementsData = data || [];
          console.log("[Page] Found", settlementsData.length, "settlements");
          setSettlements(settlementsData);
        }
      } catch (error) {
        console.error("Settlements fetch exception:", error);
        setSettlements([]);
      }

      // Calculate balances with settlements
      if (!expensesError) {
        calculateBalances(membersData || [], expensesData || [], settlementsData);
      }

      setLoading(false);
    };

    fetchGroupData();
  }, [authenticated, router, ready, groupId]);

  const calculateBalances = (membersList: any[], expensesList: any[], settlementsList?: any[]) => {
    const balanceMap = new Map();

    // Initialize balances for all members
    membersList.forEach((member) => {
      balanceMap.set(member.user_id, {
        userId: member.user_id,
        username: member.users.username,
        name: member.users.name,
        paid: 0,
        owe: 0,
        balance: 0,
      });
    });

    // Calculate how much each person paid
    expensesList.forEach((expense) => {
      const userId = expense.paid_by;
      if (balanceMap.has(userId)) {
        const current = balanceMap.get(userId);
        current.paid += parseFloat(expense.amount);
        balanceMap.set(userId, current);
      }
    });

    // Calculate how much each person owes
    expensesList.forEach((expense) => {
      expense.expense_splits.forEach((split: any) => {
        const userId = split.user_id;
        if (balanceMap.has(userId)) {
          const current = balanceMap.get(userId);
          current.owe += parseFloat(split.amount);
          balanceMap.set(userId, current);
        }
      });
    });

    // Calculate final balances
    const balancesArray = Array.from(balanceMap.values()).map((item) => ({
      ...item,
      balance: item.paid - item.owe,
    }));

    // Sort by balance (people owed money first)
    balancesArray.sort((a, b) => b.balance - a.balance);

    setBalances(balancesArray);

    // Calculate simplified debts - use passed settlements or state
    const settlementsToUse = settlementsList !== undefined ? settlementsList : settlements;
    calculateSimplifiedDebts(membersList, expensesList, settlementsToUse);
  };

  const calculateSimplifiedDebts = (membersList: any[], expensesList: any[], settlementsList: any[]) => {
    // Create debt matrix: debtMatrix[A][B] = amount A owes B
    const debtMatrix = new Map<string, Map<string, number>>();

    // Initialize matrix
    membersList.forEach((member) => {
      debtMatrix.set(member.user_id, new Map());
    });

    // Calculate debts from expenses
    expensesList.forEach((expense) => {
      const paidBy = expense.paid_by;
      const totalAmount = parseFloat(expense.amount);

      expense.expense_splits.forEach((split: any) => {
        const splitUserId = split.user_id;
        const splitAmount = parseFloat(split.amount);

        if (splitUserId !== paidBy) {
          // This person owes the payer
          const currentDebt = debtMatrix.get(splitUserId)?.get(paidBy) || 0;
          debtMatrix.get(splitUserId)?.set(paidBy, currentDebt + splitAmount);
        }
      });
    });

    // Subtract completed settlements from debts
    console.log("[Debts] Processing settlements:", settlementsList.length);
    settlementsList.forEach((settlement) => {
      if (settlement.status === 'completed') {
        const fromUser = settlement.from_user_id;
        const toUser = settlement.to_user_id;
        const amount = parseFloat(settlement.amount);

        console.log(`[Debts] Settlement: ${fromUser} paid ${toUser} $${amount}`);

        // Reduce the debt from fromUser to toUser
        const currentDebt = debtMatrix.get(fromUser)?.get(toUser) || 0;
        const newDebt = Math.max(0, currentDebt - amount); // Don't go negative

        console.log(`[Debts] Debt before: $${currentDebt}, after: $${newDebt}`);

        if (newDebt > 0) {
          debtMatrix.get(fromUser)?.set(toUser, newDebt);
        } else {
          // If fully settled, remove the debt
          debtMatrix.get(fromUser)?.delete(toUser);
        }
      }
    });

    // Simplify debts: if A owes B and B owes A, net them out
    const simplifiedDebts: any[] = [];
    const processed = new Set<string>();

    membersList.forEach((memberA) => {
      membersList.forEach((memberB) => {
        if (memberA.user_id === memberB.user_id) return;

        const pairKey = [memberA.user_id, memberB.user_id].sort().join("-");
        if (processed.has(pairKey)) return;

        const aOwesB = debtMatrix.get(memberA.user_id)?.get(memberB.user_id) || 0;
        const bOwesA = debtMatrix.get(memberB.user_id)?.get(memberA.user_id) || 0;

        const netDebt = aOwesB - bOwesA;

        if (Math.abs(netDebt) > 0.01) {
          // Threshold to avoid floating point issues
          if (netDebt > 0) {
            // A owes B
            simplifiedDebts.push({
              fromUserId: memberA.user_id,
              fromUsername: memberA.users.username,
              toUserId: memberB.user_id,
              toUsername: memberB.users.username,
              amount: Math.abs(netDebt),
            });
          } else {
            // B owes A
            simplifiedDebts.push({
              fromUserId: memberB.user_id,
              fromUsername: memberB.users.username,
              toUserId: memberA.user_id,
              toUsername: memberA.users.username,
              amount: Math.abs(netDebt),
            });
          }
        }

        processed.add(pairKey);
      });
    });

    setSimplifiedDebts(simplifiedDebts);
  };

  const handleRefreshExpenses = async () => {
    const supabase = createClient();

    // Fetch both expenses and settlements
    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses")
      .select(`
        *,
        paid_by_user:users!expenses_paid_by_fkey (
          id,
          name,
          username
        ),
        expense_splits (
          user_id,
          amount
        )
      `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    let settlementsData: any[] = [];
    try {
      const { data, error: settlementsError } = await supabase
        .from("settlements")
        .select(`
          *,
          from_user:users!settlements_from_user_id_fkey (
            id,
            name,
            username
          ),
          to_user:users!settlements_to_user_id_fkey (
            id,
            name,
            username
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (!settlementsError && data) {
        settlementsData = data;
      }
    } catch (error) {
      // Settlements table doesn't exist yet - silent fail
    }

    // Update state
    if (!expensesError) {
      setExpenses(expensesData || []);
    }
    setSettlements(settlementsData);

    // Recalculate balances with BOTH updated expenses AND settlements
    if (!expensesError) {
      calculateBalances(members, expensesData || [], settlementsData);
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

  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-yellow-400 to-blue-200 p-4">
      {/* Header */}
      <header className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
        <div className="flex justify-between items-center gap-4">
          <div>
            <Logo size="sm" />
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="border-2 border-black rounded-lg font-bold text-xs sm:text-sm whitespace-nowrap"
          >
            <span className="hidden sm:inline">← BACK TO DASHBOARD</span>
            <span className="sm:hidden">← BACK</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto">
        {/* Group info */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <h2 className="text-4xl font-heading font-black mb-2">
            {group.name}
          </h2>
          {group.description && (
            <p className="text-xl text-gray-600 mb-4">{group.description}</p>
          )}
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-yellow-400 border-2 border-black rounded-lg">
              <p className="text-sm font-bold">Currency: {group.currency}</p>
            </div>
            <div className="px-4 py-2 bg-blue-100 border-2 border-black rounded-lg">
              <p className="text-sm font-bold">{members.length} {members.length === 1 ? 'Member' : 'Members'}</p>
            </div>
          </div>
        </div>

        {/* Balances section */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <h3 className="text-2xl font-heading font-black mb-6">WHO OWES WHAT</h3>

          {simplifiedDebts.length === 0 && expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No expenses yet. Add an expense to see balances!</p>
            </div>
          ) : simplifiedDebts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-bold text-green-600">Everyone is settled up! ✓</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {simplifiedDebts.map((debt: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border-4 border-black rounded-xl bg-gradient-to-r from-red-100 to-red-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold">
                        {debt.fromUsername} owes {debt.toUsername}
                      </h4>
                      <p className="text-sm text-gray-600">Simplified debt</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          ${debt.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">USDC</p>
                      </div>
                      {/* Only show Settle Up button if the logged-in user is the one who owes */}
                      {userProfile && debt.fromUserId === userProfile.id && (
                        <Button
                          onClick={() => {
                            setSelectedDebt(debt);
                            setSettleModalOpen(true);
                          }}
                          className="bg-violet-500 text-white border-2 border-black rounded-lg font-bold hover:bg-violet-600"
                        >
                          Settle Up
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members section */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-heading font-black">MEMBERS</h3>
            <InviteLinkDialog groupId={groupId} groupName={group.name} />
          </div>

          <div className="grid gap-4">
            {members.map((member: any) => (
              <div
                key={member.id}
                className="p-4 border-4 border-black rounded-xl bg-gradient-to-r from-pink-100 to-yellow-100"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold">{member.users.name}</h4>
                      {member.role === "admin" && (
                        <span className="px-2 py-1 bg-pink-500 text-white border-2 border-black rounded text-xs font-bold">
                          CREATOR
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">@{member.users.username}</p>
                    {member.users.ens_name && (
                      <p className="text-sm text-blue-600 font-mono">{member.users.ens_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-mono break-all max-w-[200px]">
                      {member.users.wallet_address.slice(0, 6)}...{member.users.wallet_address.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses section */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-heading font-black">EXPENSES</h3>
            <AddExpenseDialog groupId={groupId} members={members} onExpenseCreated={handleRefreshExpenses} />
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl font-bold mb-2">No expenses yet</p>
              <p>Add an expense to start tracking who owes what!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="p-4 border-4 border-black rounded-xl bg-gradient-to-r from-yellow-100 to-pink-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        Paid by <span className="font-bold">@{expense.paid_by_user.username}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-600">${Number(expense.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{expense.currency}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(expense.created_at).toLocaleDateString()} • Split among {expense.expense_splits.length} members
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settlement History section */}
        {settlements.length > 0 && (
          <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            <h3 className="text-2xl font-heading font-black mb-6">SETTLEMENT HISTORY</h3>
            <div className="grid gap-4">
              {settlements.map((settlement: any) => (
                <div
                  key={settlement.id}
                  className="p-4 border-4 border-black rounded-xl bg-gradient-to-r from-green-100 to-blue-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold">
                        @{settlement.from_user.username} paid @{settlement.to_user.username}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(settlement.created_at).toLocaleDateString()} • {new Date(settlement.created_at).toLocaleTimeString()}
                      </p>
                      {settlement.transaction_hash && (
                        <>
                          <a
                            href={getExplorerUrl(settlement.source_chain_id, settlement.transaction_hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 block font-mono"
                            onClick={() => console.log("[Explorer] Chain ID:", settlement.source_chain_id, "Type:", typeof settlement.source_chain_id)}
                          >
                            Tx: {settlement.transaction_hash.slice(0, 10)}...{settlement.transaction_hash.slice(-8)}
                          </a>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${Number(settlement.amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{settlement.currency}</p>
                      <span className={`inline-block px-2 py-1 mt-2 border-2 border-black rounded text-xs font-bold ${
                        settlement.status === 'completed' ? 'bg-green-200' :
                        settlement.status === 'pending' ? 'bg-yellow-200' :
                        'bg-red-200'
                      }`}>
                        {settlement.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settlement Modal */}
      {selectedDebt && (
        <SettleUpModal
          open={settleModalOpen}
          onOpenChange={setSettleModalOpen}
          debt={selectedDebt}
          groupId={groupId}
          onSettlementComplete={handleRefreshExpenses}
        />
      )}
    </div>
  );
}
