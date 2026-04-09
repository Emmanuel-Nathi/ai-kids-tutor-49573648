import { useParams, useNavigate } from "react-router-dom";
import { useRequireChildSession } from "@/hooks/useChildSession";
import { useChildData } from "@/hooks/useChildData";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import { MissionMap } from "@/components/MissionMap";
import { Button } from "@/components/ui/button";
import { childApi } from "@/lib/childApi";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/useConfetti";

export default function ChildMissions() {
  const { childId } = useParams<{ childId: string }>();
  useRequireChildSession();
  const navigate = useNavigate();
  const { child } = useChildData(childId);

  const curriculum = child?.selected_curriculum || "cambridge";
  const grade = child?.grade || "";

  const { levels, loading, completeActivity } = useMissionProgress(childId, curriculum, grade);
  const { fireConfetti } = useConfetti();

  const handleStartMission = async (activityId: string) => {
    if (!childId) return;
    const level = levels.find(l => l.activity.id === activityId);
    if (!level) return;

    try {
      const { data } = await childApi.createSession(childId, level.activity.subject);
      const objectives = encodeURIComponent(JSON.stringify(level.activity.objectives));
      navigate(`/child/${childId}/chat?session=${data.id}&subject=${level.activity.subject}&mission=${activityId}&objectives=${objectives}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/child/${childId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-bold text-lg">Missions</span>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MissionMap levels={levels} onStartMission={handleStartMission} />
      )}
    </div>
  );
}
