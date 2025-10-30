"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/get-initial";

type Friend = {
  id: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  requested_at: string | null;
  accepted_at: string | null;
  friend_name: string;
  friend_email: string;
};

export default function FriendList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contacts/list", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load friends list");
      const data = await res.json();
      setFriends(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Unknown Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!error && !loading && friends.length === 0 && (
        <p className="text-sm text-muted-foreground">No friends.</p>
      )}

      {!loading &&
        friends.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border p-4 shadow-sm bg-background"
          >
            <div className="flex items-center gap-3">
              {/* Avatar placeholder (initials) */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold">
                {getInitials(c.friend_name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{c.friend_name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {c.friend_email}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/messages/new?to=${encodeURIComponent(c.friend_email)}`}
                className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                Message
              </Link>
              <Link
                href={`/profile/${encodeURIComponent(c.friend_name)}`}
                className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-4 shadow-sm bg-background">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
