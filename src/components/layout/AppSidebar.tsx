import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Sprout,
  Droplets,
  Briefcase,
  ArrowLeftRight,
  Store,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { AuthService } from "@/services/auth.service";

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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/auth");
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        {/* User Profile at the top */}
        <SidebarHeader className="p-2 border-b border-sidebar-border">
          <UserProfileDropdown />
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
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:justify-center"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3 group-data-[collapsible=icon]:hidden">Đăng xuất</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có muốn đăng xuất khỏi tài khoản không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Có
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

