import { Home, BookOpen, Sparkles, Gift, Shield, User, LogOut } from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useChildSession } from "@/hooks/useChildSession";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { childId } = useParams<{ childId: string }>();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useChildSession();

  const childItems = [
    { title: "Home", url: `/child/${childId}`, icon: Home },
    { title: "Learning Hub", url: `/child/${childId}/chat`, icon: BookOpen },
    { title: "Homework", url: `/child/${childId}/homework`, icon: BookOpen },
    { title: "Activities", url: `/child/${childId}/activities`, icon: Sparkles },
    { title: "Rewards", url: `/child/${childId}/rewards`, icon: Gift },
    { title: "Profile", url: `/child/${childId}/profile`, icon: User },
  ];

  const isActive = (url: string) => location.pathname === url;

  const handleParentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate("/auth");
  };

  const handleLogout = () => {
    logout();
    navigate("/child-login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {childItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Parent</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#" onClick={handleParentClick} className="hover:bg-muted/50 flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Parent Dashboard</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="hover:bg-muted/50">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Log Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
