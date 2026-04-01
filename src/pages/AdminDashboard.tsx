import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Users, CreditCard, Zap, MoreHorizontal, ShieldX, Loader2, KeyRound,
  Baby, Activity, Clock, BookOpen, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format, addDays, formatDistanceToNow } from "date-fns";
import { ActivityCreator } from "@/components/admin/ActivityCreator";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  cancelledUsers: number;
  totalChildren: number;
  sessionsLast7Days: number;
  totalXP: number;
}

interface Subscriber {
  id: string;
  user_id: string;
  display_name: string | null;
  subscription_status: string;
  created_at: string;
}

interface RecentSession {
  id: string;
  child_name: string;
  subject: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  active_time_seconds: number;
}

function adminCall(action: string, params: Record<string, unknown> = {}) {
  return supabase.functions.invoke("admin-dashboard", {
    body: { action, ...params },
  });
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [showActivityCreator, setShowActivityCreator] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" as any })
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingData(true);
    Promise.all([
      adminCall("get-stats"),
      adminCall("list-subscribers"),
      adminCall("list-recent-activity"),
    ])
      .then(([statsRes, subsRes, activityRes]) => {
        if (statsRes.data) setStats(statsRes.data);
        if (subsRes.data?.subscribers) setSubscribers(subsRes.data.subscribers);
        if (activityRes.data?.sessions) setRecentSessions(activityRes.data.sessions);
      })
      .finally(() => setLoadingData(false));
    fetchActivities();
  }, [isAdmin]);

  const fetchActivities = async () => {
    const { data } = await adminCall("manage-activities", { operation: "list" });
    if (data?.activities) setActivities(data.activities);
  };

  const toggleActivity = async (id: string, isActive: boolean) => {
    await adminCall("manage-activities", { operation: "update", activityId: id, updates: { is_active: !isActive } });
    fetchActivities();
  };

  const deleteActivity = async (id: string) => {
    await adminCall("manage-activities", { operation: "delete", activityId: id });
    toast.success("Activity deleted");
    fetchActivities();
  };

  const updateSubscription = async (profileId: string, status: string) => {
    const { error } = await adminCall("update-subscription", { profileId, status });
    if (error) {
      toast.error("Failed to update subscription");
      return;
    }
    toast.success(`Subscription updated to ${status}`);
    setSubscribers((prev) =>
      prev.map((s) => (s.id === profileId ? { ...s, subscription_status: status } : s))
    );
    const { data } = await adminCall("get-stats");
    if (data) setStats(data);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <ShieldX className="w-16 h-16 text-destructive" />
        <h1 className="font-display text-3xl font-bold text-foreground">403 — Access Denied</h1>
        <p className="text-muted-foreground">You do not have admin privileges.</p>
      </div>
    );
  }

  const statusColor = (s: string) =>
    s === "active" ? "default" : s === "trial" ? "secondary" : "destructive";

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-display">{stats?.totalUsers ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-display text-accent">{stats?.activeSubscriptions ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Trial</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-display text-secondary">{stats?.trialUsers ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Children</CardTitle>
            <Baby className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-display">{stats?.totalChildren ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Sessions (7d)</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-display">{stats?.sessionsLast7Days ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total XP</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-display">{stats?.totalXP ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers" className="mt-2">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="activities">
            <BookOpen className="w-4 h-4 mr-1" /> Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-display">Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Trial Ends</TableHead>
                        <TableHead className="w-[80px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.display_name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant={statusColor(sub.subscription_status)}>{sub.subscription_status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(addDays(new Date(sub.created_at), 30), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateSubscription(sub.id, "active")}>Activate</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateSubscription(sub.id, "cancelled")}>Cancel</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {subscribers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No subscribers yet</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : recentSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent sessions</p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {recentSessions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                          <div>
                            <p className="font-medium">{s.child_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{s.subject || "—"}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <KeyRound className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="font-display text-lg">Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="Min 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="w-full">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Activity Blueprints</CardTitle>
              <Button onClick={() => { setEditingActivity(null); setShowActivityCreator(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Activity
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Curriculum</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((act: any) => (
                    <TableRow key={act.id}>
                      <TableCell className="font-medium">{act.topic}</TableCell>
                      <TableCell>{act.grade}</TableCell>
                      <TableCell><Badge variant="outline">{act.curriculum.toUpperCase()}</Badge></TableCell>
                      <TableCell className="capitalize">{act.subject}</TableCell>
                      <TableCell>{act.difficulty}/5</TableCell>
                      <TableCell>{act.xp_reward}</TableCell>
                      <TableCell>
                        <Switch checked={act.is_active} onCheckedChange={() => toggleActivity(act.id, act.is_active)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingActivity(act); setShowActivityCreator(true); }}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteActivity(act.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No activities yet. Click "Add Activity" to create your first blueprint.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <ActivityCreator
            open={showActivityCreator}
            onClose={() => { setShowActivityCreator(false); setEditingActivity(null); }}
            onSaved={fetchActivities}
            editActivity={editingActivity}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
