import { useState, useEffect } from "react";
import { Home, BookOpen, Sparkles, Gift, Shield, User } from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { childId } = useParams<{ childId: string }>();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const childItems = [
    { title: "Home", url: `/child/${childId}`, icon: Home },
    { title: "Learning Hub", url: `/child/${childId}/chat`, icon: BookOpen },
    { title: "Homework", url: `/child/${childId}/homework`, icon: BookOpen },
    { title: "Activities", url: `/child/${childId}/activities`, icon: Sparkles },
    { title: "Rewards", url: `/child/${childId}/rewards`, icon: Gift },
    { title: "Profile", url: `/child/${childId}/profile`, icon: User },
  ];

  const isActive = (url: string) => location.pathname === url;

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleParentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLocked) {
      const secs = Math.ceil((lockedUntil! - Date.now()) / 1000);
      toast.error(`Too many attempts. Try again in ${secs}s.`);
      return;
    }
    setPinOpen(true);
    setPin("");
  };

  const handleVerify = async () => {
    if (!pin || pin.length !== 4) return;
    setLoading(true);
    try {
      // Get child's parent_id, then fetch parent's profile for pin
      const { data: child } = await supabase
        .from("children")
        .select("parent_id")
        .eq("id", childId!)
        .single();

      if (!child) { toast.error("Child not found"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("parent_pin")
        .eq("user_id", child.parent_id)
        .single();

      if (profile?.parent_pin === pin) {
        setPinOpen(false);
        setAttempts(0);
        setLockedUntil(null);
        navigate("/parent");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setLockedUntil(Date.now() + 30000);
          setPinOpen(false);
          toast.error("Too many failed attempts. Locked for 30 seconds.");
          setAttempts(0);
        } else {
          toast.error(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
        }
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
      setPin("");
    }
  };

  return (
    <>
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
      </Sidebar>

      <Dialog open={pinOpen} onOpenChange={setPinOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">🔒 Parental Access</DialogTitle>
            <DialogDescription className="text-center">
              Enter your 4-digit PIN to access supervisor settings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="text-center text-2xl tracking-[0.5em] max-w-[160px] h-14"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setPinOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleVerify} disabled={pin.length !== 4 || loading}>
                {loading ? "Verifying…" : "Verify"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
