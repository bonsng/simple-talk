import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 rounded-md flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
