import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Sparkles, Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const subjects = [
  { value: "math", label: "Maths" },
  { value: "english", label: "English" },
  { value: "science", label: "Science" },
  { value: "general", label: "General" },
  { value: "life_orientation", label: "Life Orientation" },
  { value: "natural_sciences", label: "Natural Sciences" },
  { value: "history", label: "History" },
];

const grades = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

interface ActivityCreatorProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editActivity?: any;
}

function adminCall(action: string, params: Record<string, unknown> = {}) {
  return supabase.functions.invoke("admin-dashboard", { body: { action, ...params } });
}

export function ActivityCreator({ open, onClose, onSaved, editActivity }: ActivityCreatorProps) {
  const [topic, setTopic] = useState(editActivity?.topic || "");
  const [grade, setGrade] = useState(editActivity?.grade || "3");
  const [curriculum, setCurriculum] = useState(editActivity?.curriculum || "cambridge");
  const [subject, setSubject] = useState(editActivity?.subject || "general");
  const [difficulty, setDifficulty] = useState([editActivity?.difficulty || 1]);
  const [xpReward, setXpReward] = useState(editActivity?.xp_reward || 30);
  const [objectives, setObjectives] = useState<string[]>(editActivity?.objectives || [""]);
  const [sortOrder, setSortOrder] = useState(editActivity?.sort_order || 0);
  const [preview, setPreview] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addObjective = () => setObjectives([...objectives, ""]);
  const removeObjective = (i: number) => setObjectives(objectives.filter((_, idx) => idx !== i));
  const updateObjective = (i: number, val: string) => {
    const next = [...objectives];
    next[i] = val;
    setObjectives(next);
  };

  const generatePreview = async () => {
    if (!topic) { toast.error("Enter a topic first"); return; }
    setPreviewLoading(true);
    setPreview("");
    const { data, error } = await adminCall("preview-activity", {
      topic, grade, curriculum, objectives: objectives.filter(Boolean),
    });
    setPreviewLoading(false);
    if (error || data?.error) {
      toast.error(data?.error || "Failed to generate preview");
      return;
    }
    setPreview(data.preview);
  };

  const handleSave = async () => {
    if (!topic.trim()) { toast.error("Topic is required"); return; }
    setSaving(true);
    const payload = {
      topic: topic.trim(),
      grade,
      curriculum,
      subject,
      objectives: objectives.filter(Boolean),
      difficulty: difficulty[0],
      xp_reward: xpReward,
      sort_order: sortOrder,
    };

    const operation = editActivity ? "update" : "create";
    const extra = editActivity ? { activityId: editActivity.id, updates: payload } : payload;

    const { error, data } = await adminCall("manage-activities", { operation, ...extra });
    setSaving(false);
    if (error || data?.error) {
      toast.error(data?.error || "Failed to save activity");
      return;
    }
    toast.success(editActivity ? "Activity updated" : "Activity created");
    onSaved();
    onClose();
  };

  const difficultyLabels = ["Intro", "Basic", "Medium", "Advanced", "Mastery"];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editActivity ? "Edit Activity" : "Create Activity Blueprint"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input placeholder="e.g. Photosynthesis, Long Division" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Curriculum</Label>
                <Select value={curriculum} onValueChange={setCurriculum}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cambridge">Cambridge</SelectItem>
                    <SelectItem value="caps">CAPS</SelectItem>
                    <SelectItem value="ieb">IEB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty: {difficultyLabels[difficulty[0] - 1]} ({difficulty[0]}/5)</Label>
              <Slider min={1} max={5} step={1} value={difficulty} onValueChange={setDifficulty} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" min={5} max={500} value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Learning Objectives</Label>
                <Button variant="ghost" size="sm" onClick={addObjective}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Objective ${i + 1}`}
                      value={obj}
                      onChange={(e) => updateObjective(i, e.target.value)}
                    />
                    {objectives.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeObjective(i)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={generatePreview} disabled={previewLoading}>
              {previewLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Preview
            </Button>

            {preview && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display">AI Preview</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert text-xs max-h-[250px] overflow-y-auto">
                  <ReactMarkdown>{preview}</ReactMarkdown>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {editActivity ? "Update" : "Save Activity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
