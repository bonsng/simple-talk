"use client";

import * as React from "react";
import { Command, Contact, Send } from "lucide-react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Session } from "next-auth";
import Link from "next/link";

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  session: Session | null;
};

// This is sample data
const data = {
  navMain: [
    {
      title: "Contacts",
      url: "/dashboard/contact",
      icon: Contact,
      isActive: false,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: Send,
      isActive: false,
    },
  ],
};

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState("");
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setActiveItem("")}
              asChild
              className="md:h-8 md:p-0"
            >
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="text-left text-xl flex-1 ml-1 font-medium leading-tight">
                  Simple Talk
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    onClick={() => {
                      setOpenMobile(false);
                      setActiveItem(item.title);
                    }}
                    isActive={activeItem === item.title}
                    className="px-2.5 md:px-2"
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}

      {/*<Sidebar collapsible="none" className="hidden flex-1 md:flex">*/}
      {/*  <SidebarHeader className="gap-3.5 border-b p-4">*/}
      {/*    <div className="flex w-full items-center justify-between">*/}
      {/*      <div className="text-foreground text-base font-medium">*/}
      {/*        {activeItem}*/}
      {/*      </div>*/}
      {/*      <Label className="flex items-center gap-2 text-sm">*/}
      {/*        <span>Unreads</span>*/}
      {/*        <Switch className="shadow-none" />*/}
      {/*      </Label>*/}
      {/*    </div>*/}
      {/*    <SidebarInput placeholder="Type to search..." />*/}
      {/*  </SidebarHeader>*/}
      {/*  <SidebarContent>*/}
      {/*    <SidebarGroup className="px-0">*/}
      {/*      <SidebarGroupContent>*/}
      {/*        {mails.map((mail) => (*/}
      {/*          <a*/}
      {/*            href="#"*/}
      {/*            key={mail.email}*/}
      {/*            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"*/}
      {/*          >*/}
      {/*            <div className="flex w-full items-center gap-2">*/}
      {/*              <span>{mail.name}</span>{" "}*/}
      {/*              <span className="ml-auto text-xs">{mail.date}</span>*/}
      {/*            </div>*/}
      {/*            <span className="font-medium">{mail.subject}</span>*/}
      {/*            <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">*/}
      {/*              {mail.teaser}*/}
      {/*            </span>*/}
      {/*          </a>*/}
      {/*        ))}*/}
      {/*      </SidebarGroupContent>*/}
      {/*    </SidebarGroup>*/}
      {/*  </SidebarContent>*/}
      {/*</Sidebar>*/}
    </Sidebar>
  );
}
