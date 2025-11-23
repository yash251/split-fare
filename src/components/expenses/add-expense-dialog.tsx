"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrivyAuth } from "@/hooks/use-privy-auth";

interface AddExpenseDialogProps {
  groupId: string;
  members: any[];
  onExpenseCreated?: () => void;
}

export function AddExpenseDialog({ groupId, members, onExpenseCreated }: AddExpenseDialogProps) {
  const { user } = usePrivyAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    paidBy: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/expenses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          description: formData.description,
          amount: parseFloat(formData.amount),
          paidBy: formData.paidBy,
          privyId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create expense");
        setLoading(false);
        return;
      }

      // Success! Reset form and close dialog
      setFormData({ description: "", amount: "", paidBy: "" });
      setOpen(false);
      onExpenseCreated?.();
    } catch (error) {
      console.error("Error creating expense:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-violet-500 text-white border-2 border-black rounded-lg font-bold hover:bg-violet-600">
          + ADD EXPENSE
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-black">
            ADD EXPENSE
          </DialogTitle>
          <DialogDescription>
            Track a new expense and split it with your group
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <Input
              type="text"
              placeholder="Dinner at restaurant"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="border-2 border-black rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Amount (USDC)</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="50.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="border-2 border-black rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Who Paid?</label>
            <Select
              value={formData.paidBy}
              onValueChange={(value) => setFormData({ ...formData, paidBy: value })}
              required
            >
              <SelectTrigger className="border-2 border-black rounded-lg">
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member: any) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.users.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 This expense will be split equally among all {members.length} group members
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-2 border-black rounded-lg font-bold"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.description || !formData.amount || !formData.paidBy}
              className="flex-1 bg-violet-500 text-white border-2 border-black rounded-lg font-bold hover:bg-violet-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "CREATING..." : "ADD EXPENSE"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
