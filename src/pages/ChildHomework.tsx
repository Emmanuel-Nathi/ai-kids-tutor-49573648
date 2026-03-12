import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, Camera, Upload, Loader2, CheckCircle, XCircle, HelpCircle, MessageSquare } from "lucide-react";
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

export default function ChildHomework() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [childData, setChildData] = useState<{ grade: string; selected_curriculum: string } | null>(null);

  useEffect(() => {
    if (childId) {
      supabase.from("children").select("grade, selected_curriculum").eq("id", childId).single().then(({ data }) => {
        if (data) setChildData(data as any);
      });
    }
  }, [childId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !childId || !user) return;

    // Preview
    setPreviewUrl(URL.createObjectURL(file));
    setParsedContent(null);
    setUploading(true);

    try {
      // Upload to storage
      const fileName = `${childId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("homework-uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("homework-uploads").getPublicUrl(fileName);

      // Create homework record
      const { data: hw, error: hwError } = await supabase.from("homework").insert({
        child_id: childId,
        image_url: urlData.publicUrl || fileName,
        status: "uploaded",
      }).select("id").single();

      if (hwError) throw hwError;

      setUploading(false);
      setParsing(true);

      // Convert to base64 for vision API
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        try {
          const resp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/homework-parse`,
            {
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
                homework_id: hw.id,
              }),
            }
          );

          if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.error || "Failed to parse");
          }

          const result = await resp.json();
          setParsedContent(result.parsed_content);
          toast.success("Homework scanned! 📸");
        } catch (err: any) {
          toast.error(err.message || "Failed to analyze homework");
        } finally {
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

  const getStatusIcon = (correct: boolean | null) => {
    if (correct === true) return <CheckCircle className="w-5 h-5 text-accent" />;
    if (correct === false) return <XCircle className="w-5 h-5 text-destructive" />;
    return <HelpCircle className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/child/${childId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-bold text-lg">📸 Homework Scanner</span>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        {!parsedContent && !uploading && !parsing && (
          <>
            <OwlMascot
              size="md"
              message="Take a photo of your worksheet and I'll help you solve it!"
              className="mx-auto pt-4"
            />
            <Card
              className="border-dashed border-2 border-primary/30 cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <Camera className="w-16 h-16 text-primary/40" />
                <p className="text-sm text-muted-foreground text-center">
                  Tap to upload a photo of your homework
                </p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" /> Choose File
                </Button>
              </CardContent>
            </Card>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
          </>
        )}

        {(uploading || parsing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-12"
          >
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
              <img
                src={previewUrl}
                alt="Homework"
                className="w-full rounded-lg max-h-48 object-cover"
              />
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {parsedContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Detected Problems</h3>
                {parsedContent.detected_subject && (
                  <Badge variant="secondary" className="capitalize">
                    {parsedContent.detected_subject}
                  </Badge>
                )}
              </div>

              {parsedContent.summary && (
                <p className="text-sm text-muted-foreground">{parsedContent.summary}</p>
              )}

              {parsedContent.problems.map((problem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
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
                      {problem.hint && (
                        <p className="text-xs text-primary italic">💡 {problem.hint}</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => navigate(
                          `/child/${childId}/chat?subject=${parsedContent.detected_subject || "general"}&context=${encodeURIComponent(problem.question)}`
                        )}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" /> Get Help from Owl
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setParsedContent(null);
                  setPreviewUrl(null);
                }}
              >
                Scan Another Worksheet
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
