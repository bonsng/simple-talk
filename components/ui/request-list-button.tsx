"use client";

import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type IncomingRequest = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  requested_at: string | null;
  requester_name: string;
  requester_email: string;
};

export default function RequestListButton() {
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<IncomingRequest[]>([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/contacts/requests?type=incoming", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      setRequests(data ?? []);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unknown error");
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (id: number) => {
    try {
      const res = await fetch("/api/contacts/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId: id }),
      });
      if (!res.ok) throw new Error("Failed to accept request");
      toast.success("Friend request accepted!");
      await load();
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch("/api/contacts/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId: id }),
      });
      if (!res.ok) throw new Error("Failed to reject request");
      toast.success("Friend request rejected!");
      await load();
    } catch (e: unknown) {
      console.error(e);
    }
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full relative"
          >
            <Bell />
            {!!requests.length && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Requests</DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="grid gap-3">
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!error && requests.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No incoming requests.
              </p>
            )}

            <ul className="space-y-2">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {`From: ${r.requester_name} (${r.requester_email})`}
                    </p>
                    {r.requested_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.requested_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleAccept(r.id);
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReject(r.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
