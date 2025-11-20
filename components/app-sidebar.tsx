"use client";

import * as React from "react";
import {
  AudioWaveform,
  Bot,
  Command,
  GalleryVerticalEnd,
  Cable,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  teams: [{ name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" }],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Bot,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: Command,
    },
    {
      title: "Category",
      url: "/admin/category",
      icon: Cable,
    },

    {
      title: "Karzina Oylik",
      url: "/admin/orders-moth",
      icon: AudioWaveform,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user?: any }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
