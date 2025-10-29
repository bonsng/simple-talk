import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { alumniSans } from "@/lib/font";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/dark-mode-icon";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${alumniSans.className} antialiased`}>
        <Toaster position="top-center" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
