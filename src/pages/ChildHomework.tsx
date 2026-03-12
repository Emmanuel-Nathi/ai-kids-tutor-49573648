import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, Camera, Upload } from "lucide-react";

export default function ChildHomework() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/child/${childId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-bold text-lg">📸 Homework Scanner</span>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <OwlMascot size="md" message="Take a photo of your worksheet and I'll help you solve it!" className="mx-auto pt-4" />
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Camera className="w-16 h-16 text-primary/40" />
            <p className="text-sm text-muted-foreground text-center">Upload a photo of your homework</p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" /> Choose File
            </Button>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground text-center">
          Homework scanner with AI vision coming soon! For now, use the chat to type your questions.
        </p>
      </main>
    </div>
  );
}
