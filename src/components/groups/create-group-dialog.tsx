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
import { usePrivyAuth } from "@/hooks/use-privy-auth";

interface CreateGroupDialogProps {
  onGroupCreated?: () => void;
}

export function CreateGroupDialog({ onGroupCreated }: CreateGroupDialogProps) {
  const { user } = usePrivyAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          privyId: user?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create group");
        setLoading(false);
        return;
      }

      // Success! Reset form and close dialog
      setFormData({ name: "", description: "" });
      setOpen(false);
      onGroupCreated?.();
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-400 text-black border-2 border-black rounded-lg font-bold hover:bg-yellow-500">
          + CREATE GROUP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-black">
            CREATE NEW GROUP
          </DialogTitle>
          <DialogDescription>
            Start splitting expenses with friends!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-bold mb-2">Group Name</label>
            <Input
              type="text"
              placeholder="Weekend Trip"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-2 border-black rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Description (optional)
            </label>
            <Input
              type="text"
              placeholder="Our awesome trip to the beach"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border-2 border-black rounded-lg"
            />
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
              disabled={loading || !formData.name}
              className="flex-1 bg-violet-500 text-white border-2 border-black rounded-lg font-bold hover:bg-violet-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "CREATING..." : "CREATE GROUP"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}