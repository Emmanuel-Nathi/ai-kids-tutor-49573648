import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/50 backdrop-blur-md bg-card/80 px-2 shrink-0 md:hidden sticky top-0 z-40">
            <SidebarTrigger />
          </header>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
