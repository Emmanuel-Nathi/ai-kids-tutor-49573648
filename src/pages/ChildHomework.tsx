import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequireChildSession } from "@/hooks/useChildSession";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OwlMascot } from "@/components/OwlMascot";
import { Sparkle } from "@/components/Sparkle";
import { Camera, Upload, Loader2, CheckCircle, XCircle, HelpCircle, MessageSquare, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Problem {
  number: number;
  question: string;
  student_answer: string | null;
  appears_correct: boolean | null;
  hint: string;
}

interface ParsedContent {
  detected_subject: string;
  problems: Problem[];
  summary: string;
}

const curriculumActivities: Record<string, { title: string; emoji: string; desc: string }[]> = {
  cambridge: [
    { title: "Science Investigation", emoji: "🔬", desc: "Explore a Cambridge science puzzle" },
    { title: "Global Perspectives", emoji: "🌍", desc: "Think globally, act locally" },
  ],
  caps: [
    { title: "SA History Quiz", emoji: "🇿🇦", desc: "Test your South African knowledge" },
    { title: "Life Orientation Challenge", emoji: "🧭", desc: "Skills for everyday life" },
  ],
  ieb: [
    { title: "Critical Thinking Puzzle", emoji: "🧩", desc: "Sharpen your analytical mind" },
    { title: "Research Project", emoji: "📚", desc: "Dive deep into a topic" },
  ],
};

export default function ChildHomework() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  useRequireChildSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [childData, setChildData] = useState<{ grade: string; selected_curriculum: string } | null>(null);
  const [homeworkId, setHomeworkId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    if (childId) {
      supabase.from("children_safe").select("grade, selected_curriculum").eq("id", childId).single().then(({ data }) => {
        if (data) setChildData(data as any);
      });
    }
  }, [childId]);

  const awardPoints = async (amount: number, reason: string) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ child_id: childId, amount, reason }),
      });
    } catch {}
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !childId) return;

    setPreviewUrl(URL.createObjectURL(file));
    setParsedContent(null);
    setCompleted(false);
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          // Upload + parse in one server-side call
          const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/homework-parse`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              image_base64: base64,
              child_id: childId,
              subject: null,
              curriculum: childData?.selected_curriculum || "cambridge",
              grade: childData?.grade || "1",
              action: "upload",
            }),
          });

          setUploading(false);
          setParsing(true);

          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.error || "Failed to process homework");
          }

          const result = await resp.json();
          setHomeworkId(result.homework_id);

          // Award 10 XP for uploading
          await awardPoints(10, "📸 Homework uploaded");
          setEarnedPoints(10);
          toast.success("Homework uploaded! +10 XP 📸");

          // Analytics tracking
          window.posthog?.capture('homework_uploaded', { child_id: childId, subject: childData?.selected_curriculum });
          window.gtag?.('event', 'homework_upload', { child_id: childId });

          setParsedContent(result.parsed_content);
          toast.success("Homework scanned! 📸");
        } catch (err: any) {
          toast.error(err.message || "Failed to analyze homework");
        } finally {
          setUploading(false);
          setParsing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setUploading(false);
      setParsing(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!homeworkId || !childId) return;

    await supabase.from("homework").update({ status: "completed" }).eq("id", homeworkId);
    await awardPoints(20, "✅ Homework completed");
    setEarnedPoints((prev) => prev + 20);
    setCompleted(true);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
    toast.success("Homework complete! +20 XP 🎉");

    // Analytics tracking
    window.posthog?.capture('homework_completed', { child_id: childId });
    window.gtag?.('event', 'homework_complete', { child_id: childId });
  };

  const getStatusIcon = (correct: boolean | null) => {
    if (correct === true) return <CheckCircle className="w-5 h-5 text-accent" />;
    if (correct === false) return <XCircle className="w-5 h-5 text-destructive" />;
    return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
  };

  const curriculum = childData?.selected_curriculum || "cambridge";
  const suggestedActivities = curriculumActivities[curriculum] || curriculumActivities.cambridge;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <span className="font-display font-bold text-lg">📸 Homework Scanner</span>
        {earnedPoints > 0 && (
          <Badge variant="secondary" className="ml-auto bg-star-gold/20 text-foreground">
            +{earnedPoints} XP
          </Badge>
        )}
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {!parsedContent && !uploading && !parsing && !completed && (
          <>
            <OwlMascot size="md" message="Take a photo of your worksheet and I'll help you solve it!" className="mx-auto pt-4" />
            <Card
              className="border-dashed border-2 border-primary/30 cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <Camera className="w-16 h-16 text-primary/40" />
                <p className="text-sm text-muted-foreground text-center">Tap to upload a photo of your homework</p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" /> Choose File
                </Button>
              </CardContent>
            </Card>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
          </>
        )}

        {(uploading || parsing) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-12">
            <OwlMascot size="md" variant="thinking" />
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {uploading ? "Uploading your homework..." : "Owl is reading your worksheet... 🔍"}
            </p>
          </motion.div>
        )}

        {previewUrl && !uploading && !parsing && (
          <Card>
            <CardContent className="p-2">
              <img src={previewUrl} alt="Homework" className="w-full rounded-lg max-h-48 object-cover" />
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {parsedContent && !completed && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Detected Problems</h3>
                {parsedContent.detected_subject && (
                  <Badge variant="secondary" className="capitalize">{parsedContent.detected_subject}</Badge>
                )}
              </div>

              {parsedContent.summary && <p className="text-sm text-muted-foreground">{parsedContent.summary}</p>}

              {parsedContent.problems.map((problem, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Question {problem.number}</span>
                        {getStatusIcon(problem.appears_correct)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">{problem.question}</p>
                      {problem.student_answer && (
                        <p className="text-sm text-muted-foreground">
                          Your answer: <span className="font-medium text-foreground">{problem.student_answer}</span>
                        </p>
                      )}
                      {problem.hint && <p className="text-xs text-primary italic">💡 {problem.hint}</p>}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => navigate(`/child/${childId}/chat?subject=${parsedContent.detected_subject || "general"}&context=${encodeURIComponent(problem.question)}`)}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" /> Get Help from Owl
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <Button className="w-full text-lg py-6" onClick={handleMarkComplete}>
                <CheckCircle className="w-5 h-5 mr-2" /> Mark as Complete ✅
              </Button>

              <Button variant="outline" className="w-full" onClick={() => { setParsedContent(null); setPreviewUrl(null); setHomeworkId(null); }}>
                Scan Another Worksheet
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration + Pivot to Activities */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="relative inline-block">
                <OwlMascot size="lg" variant="celebrate" pose="celebrate" message="High five! ✋ Homework is done!" className="mx-auto" />
                <Sparkle active={showCelebration} count={5} />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-star-gold/10 rounded-2xl p-4 border border-star-gold/30"
              >
                <PartyPopper className="w-8 h-8 text-star-gold mx-auto mb-2" />
                <p className="font-display font-bold text-lg">You earned {earnedPoints} XP! 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">Want to double them? Try an Extra-Curricular challenge below!</p>
              </motion.div>

              <div className="space-y-3">
                <h3 className="font-display font-semibold text-left flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Brain Boost Challenges
                </h3>
                {suggestedActivities.map((a, i) => (
                  <motion.div
                    key={a.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                      onClick={() => navigate(`/child/${childId}/activities`)}
                    >
                      <CardContent className="flex items-center gap-3 py-4">
                        <span className="text-2xl">{a.emoji}</span>
                        <div className="text-left">
                          <p className="font-display font-semibold text-sm">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" className="w-full" onClick={() => { setParsedContent(null); setPreviewUrl(null); setHomeworkId(null); setCompleted(false); setEarnedPoints(0); }}>
                Scan Another Worksheet
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
