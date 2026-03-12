import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, Code, Brain, Pencil, Puzzle } from "lucide-react";

const activities = [
  { icon: Code, title: "Coding Puzzles", desc: "Learn logic with fun challenges", emoji: "💻" },
  { icon: Brain, title: "Logic Games", desc: "Train your brain muscles", emoji: "🧩" },
  { icon: Pencil, title: "Creative Writing", desc: "Write stories and poems", emoji: "✍️" },
  { icon: Puzzle, title: "Quiz Challenge", desc: "Test your knowledge", emoji: "❓" },
];

export default function ChildActivities() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/child/${childId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-bold text-lg">✨ After-School Fun</span>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <OwlMascot size="md" message="Homework done? Let's do something fun! 🎉" className="mx-auto pt-4" />
        <div className="grid grid-cols-2 gap-3">
          {activities.map((a) => (
            <Card key={a.title} className="cursor-pointer hover:shadow-md transition-shadow active:scale-95">
              <CardContent className="flex flex-col items-center gap-2 py-6">
                <span className="text-3xl">{a.emoji}</span>
                <span className="font-display font-semibold text-sm">{a.title}</span>
                <span className="text-xs text-muted-foreground text-center">{a.desc}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Activities are based on Cambridge Learner Attributes. More coming soon!
        </p>
      </main>
    </div>
  );
}
