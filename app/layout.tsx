import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { alumniSans } from "@/lib/font";
import DarkModeIcon from "@/components/dark-mode-icon";

export const metadata: Metadata = {
  title: "Simple Talk",
  description: "Simple chat service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${alumniSans.className} antialiased`}>
        <DarkModeIcon />
        {children}
      </body>
    </html>
  );
}
