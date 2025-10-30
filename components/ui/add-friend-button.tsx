"use client";

import * as React from "react";

import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { ChangeEvent, useCallback, useState } from "react";
import { getInitials } from "@/lib/get-initial";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";
import { Skeleton } from "@/components/ui/skeleton";
export default function AddFriendButton() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full">
            <Plus />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Contact</DialogTitle>
            <DialogDescription>
              Enter your friend’s name to send a request.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Plus />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>New Contact</DialogTitle>
          <DialogDescription>
            Enter your friend’s name to send a request.
          </DialogDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type SearchResult = {
  id: string;
  name: string;
  email: string;
};

function ProfileForm({ className }: React.ComponentProps<"div">) {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResult([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/search?term=${term.toLowerCase()}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to load users");
    const data = await res.json();
    setResult(data ?? []);
    setLoading(false);
  }, []);

  const debouncedSearch = useDebounceCallback(performSearch, 300);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  return (
    <div className={cn("grid items-start gap-6", className)}>
      <div className="grid gap-3">
        <Label htmlFor="name">Search by Username</Label>
        <Input
          type="text"
          id="name"
          placeholder="Enter username to search"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <p>Search Result</p>
        <div className="border h-52 rounded-lg p-2 overflow-y-auto justify-center items-center flex-col">
          {!loading && result.length === 0 && (
            <div className="w-full h-full flex justify-center items-center">
              No Result
            </div>
          )}
          {loading && (
            <>
              <SearchSkeleton />
              <SearchSkeleton />
            </>
          )}

          {!loading &&
            result.map((user) => (
              <SearchResultCard key={user.id} props={user} />
            ))}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ props }: { props: SearchResult }) {
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  async function sendRequest(name: string) {
    try {
      const res = await fetch("/api/contacts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to send request");
      toast.success("Friend request sent!");
      setRequestSuccess(true);
      console.log("Request sent successfully!");
    } catch (err) {
      console.error("Error sending request:", err);
    }
  }

  return (
    <div
      key={props.id}
      className="rounded-lg border p-1 shadow-sm bg-background flex justify-between mb-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold">
          {getInitials(props.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{props.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {props.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {requestSuccess ? (
          <Button disabled={requestSuccess} className="w-16">
            Sent
          </Button>
        ) : (
          <Button
            onClick={() => sendRequest(props.name)}
            variant="outline"
            className="w-16"
          >
            Request
          </Button>
        )}
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="rounded-lg border p-1 shadow-sm bg-background mb-3">
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
