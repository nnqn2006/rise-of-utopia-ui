import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Sprout,
  Droplets,
  Briefcase,
  TrendingUp,
  ArrowLeftRight,
  Store,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  mode: "farmer" | "trader";
}

const farmerNavItems = [
  { title: "Bảng điều khiển", url: "/farmer/dashboard", icon: LayoutDashboard },
  { title: "Nông trại", url: "/farmer/farm", icon: Sprout },
  { title: "Hồ thanh khoản", url: "/farmer/liquidity", icon: Droplets },
  { title: "Danh mục đầu tư", url: "/farmer/portfolio", icon: Briefcase },
];

const traderNavItems = [
  { title: "Bảng điều khiển", url: "/trader/dashboard", icon: LayoutDashboard },
  { title: "Swap", url: "/trader/swap", icon: ArrowLeftRight },
  { title: "Cửa hàng của bạn", url: "/trader/store", icon: Store },
  { title: "Danh mục đầu tư", url: "/trader/portfolio", icon: Briefcase },
];

export function AppSidebar({ mode }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = mode === "farmer" ? farmerNavItems : traderNavItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-foreground">Rise of Ledger</h2>
            <p className="text-xs text-muted-foreground">
              {mode === "farmer" ? "Nông dân" : "Thương nhân"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:justify-center"
          onClick={() => navigate("/")}
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3 group-data-[collapsible=icon]:hidden">Đăng xuất</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
