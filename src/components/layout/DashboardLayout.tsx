import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ModeToggle } from "./ModeToggle";

interface DashboardLayoutProps {
  children: ReactNode;
  mode: "farmer" | "trader";
}

export function DashboardLayout({ children, mode }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar mode={mode} />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Mạng: Testnet
            </div>
          </header>
          <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </main>
        <ModeToggle />
      </div>
    </SidebarProvider>
  );
}
