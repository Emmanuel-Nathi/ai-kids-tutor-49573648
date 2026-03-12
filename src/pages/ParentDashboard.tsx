import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwlMascot } from "@/components/OwlMascot";
import { Plus, LogOut, BookOpen, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Child {
  id: string;
  name: string;
  grade: string;
  curriculum_level: string;
  avatar_url: string | null;
}

export default function ParentDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", grade: "1", curriculum_level: "primary" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .order("created_at");
    if (error) toast.error(error.message);
    else setChildren(data || []);
    setLoading(false);
  };

  const addChild = async () => {
    if (!user || !newChild.name.trim()) return;
    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: newChild.name.trim(),
      grade: newChild.grade,
      curriculum_level: newChild.curriculum_level,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(`${newChild.name} added!`);
      setNewChild({ name: "", grade: "1", curriculum_level: "primary" });
      setAddOpen(false);
      fetchChildren();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <OwlMascot size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <OwlMascot size="sm" animate={false} />
          <span className="font-display font-bold text-lg">Parent Dashboard</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
          <LogOut className="w-4 h-4 mr-1" /> Sign Out
        </Button>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Your Children</h2>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Child</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Add a Child</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Child's Name</Label>
                  <Input
                    placeholder="e.g. Sarah"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade / Year</Label>
                  <Select value={newChild.grade} onValueChange={(v) => setNewChild({ ...newChild, grade: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>Year {i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Curriculum Level</Label>
                  <Select value={newChild.curriculum_level} onValueChange={(v) => setNewChild({ ...newChild, curriculum_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="lower_secondary">Lower Secondary</SelectItem>
                      <SelectItem value="upper_secondary">Upper Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={addChild}>Add Child</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {children.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <OwlMascot size="lg" message="Add your first child to get started!" className="mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child) => (
              <Card
                key={child.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30"
                onClick={() => navigate(`/child/${child.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {child.name[0]}
                    </div>
                    {child.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Year {child.grade}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-star-gold" /> 0 pts</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 0 sessions</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
