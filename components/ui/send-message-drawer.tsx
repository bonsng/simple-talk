"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

export default function SendMessageDrawer({ type }: { type: string }) {
  const [toValue, setToValue] = useState("");
  type Friend = {
    id: number;
    friend_id: string;
    friend_name: string;
    friend_email: string;
    status: "accepted";
    requested_at: string | null;
    accepted_at: string | null;
  };
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/contacts/list", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load friends");
        const data = await res.json();
        if (mounted) setFriends(data ?? []);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = toValue.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter(
      (f) =>
        f.friend_name.toLowerCase().includes(q) ||
        f.friend_email.toLowerCase().includes(q),
    );
  }, [friends, toValue]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {type === "icon" ? (
          <Button variant="outline" size="icon" className="cursor-pointer">
            <Send />
          </Button>
        ) : (
          <Button className="mt-3">Send Message</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-y">
          <Label htmlFor="name" className="w-6 text-lg">
            To
          </Label>
          <Input
            id="name"
            autoFocus
            value={toValue}
            onChange={(e) => setToValue(e.target.value)}
            className="flex-1 border-none focus:border-none focus:outline-none focus:ring-0"
            placeholder="Search..."
          />
        </div>

        <div className="max-h-72 overflow-auto py-2">
          {loading && (
            <div className="grid gap-2">
              <div className="h-10 rounded-md bg-muted animate-pulse" />
              <div className="h-10 rounded-md bg-muted animate-pulse" />
              <div className="h-10 rounded-md bg-muted animate-pulse" />
            </div>
          )}
          {error && <p className="text-sm text-red-600 px-1">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground px-1">
              No friends found.
            </p>
          )}
          <ul className="divide-y rounded-md border">
            {filtered.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-3 p-2 hover:bg-muted/60 cursor-pointer"
                onClick={() => setToValue(f.friend_email)}
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{f.friend_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {f.friend_email}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setToValue(f.friend_email)}
                >
                  Select
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
