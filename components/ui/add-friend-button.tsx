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
import { useState } from "react";
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
          <ProfileForm setOpen={setOpen} />
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
            Enter your friend’s email to send a request.
          </DialogDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" setOpen={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({
  className,
  setOpen,
}: React.ComponentProps<"form"> & { setOpen?: (value: boolean) => void }) {
  const [requestName, setRequestName] = useState("");

  async function sendRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!requestName.trim()) return;

    try {
      const res = await fetch("/api/contacts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: requestName }),
      });
      if (!res.ok) throw new Error("Failed to send request");
      toast.success("Friend request sent!");
      setOpen?.(false);
      console.log("Request sent successfully!");
    } catch (err) {
      console.error("Error sending request:", err);
    }
  }

  return (
    <form
      onSubmit={sendRequest}
      className={cn("grid items-start gap-6", className)}
    >
      <div className="grid gap-3">
        <Label htmlFor="name">Username</Label>
        <Input
          type="text"
          id="name"
          placeholder="Enter Username."
          value={requestName}
          onChange={(e) => setRequestName(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={requestName.trim().length === 0}>
        Send Request
      </Button>
    </form>
  );
}
