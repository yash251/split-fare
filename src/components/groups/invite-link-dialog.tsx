"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface InviteLinkDialogProps {
  groupId: string;
  groupName: string;
}

export function InviteLinkDialog({ groupId, groupName }: InviteLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a simple invite link using the group ID
  const inviteUrl = `${window.location.origin}/invite/${groupId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-400 text-black border-2 border-black rounded-lg font-bold hover:bg-yellow-500">
          + ADD MEMBER
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-black">
            INVITE TO {groupName.toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Share this link with friends to invite them to the group
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-bold mb-2">Invite Link</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={inviteUrl}
                readOnly
                className="border-2 border-black rounded-lg font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopy}
                className={`${
                  copied
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-violet-500 hover:bg-violet-600"
                } text-white border-2 border-black rounded-lg font-bold whitespace-nowrap`}
              >
                {copied ? "COPIED!" : "COPY"}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Anyone with this link can join the group. Share it only with people you trust!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
