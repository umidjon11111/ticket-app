"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { ModeToggle } from "./_components/ModeToggle";
import NotFound from "@/components/404/NotFound";
import { ThemeProvider } from "@/components/providers/theme-provider";
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  if (!session?.user) return <NotFound />;
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar user={session?.user} />
        <SidebarInset>
          <header className="flex border-b h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <ModeToggle />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Layout;
