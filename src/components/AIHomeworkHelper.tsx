import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Bot, Camera, ChevronDown, ChevronUp, Mic, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIHomeworkHelperProps {
  childId: string;
}

function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AIHomeworkHelper({ childId }: AIHomeworkHelperProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [childGrade, setChildGrade] = useState("");
  const [childCurriculum, setChildCurriculum] = useState("cambridge");
  const [childLanguage, setChildLanguage] = useState("english");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile keyboard fix: listen to visualViewport resize
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => setViewportHeight(vv.height);
    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-ZA";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone in your browser settings.");
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  useEffect(() => {
    if (childId) {
      supabase
        .from("children")
        .select("grade, curriculum_level, selected_curriculum, preferred_language")
        .eq("id", childId)
        .single()
        .then(({ data }) => {
          if (data) {
            setChildGrade(data.grade);
            setChildCurriculum((data as any).selected_curriculum || "cambridge");
            setChildLanguage((data as any).preferred_language || "english");
          }
        });
    }
  }, [childId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {
      toast.error("Failed to process image");
    }
    e.target.value = "";
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !imagePreview) || isStreaming) return;

    const userMsg: Message = { role: "user", content: text || "📷 [Photo uploaded]" };
    setMessages((prev) => [...prev, userMsg]);
    const currentImage = imagePreview;
    setInput("");
    setImagePreview(null);
    setIsStreaming(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            subject: "general",
            grade: childGrade,
            curriculum: childCurriculum,
            preferred_language: childLanguage,
            ...(currentImage ? { image_base64: currentImage } : {}),
          }),
        }
      );

      if (resp.status === 429) { toast.error("Too many requests. Please wait a moment."); setIsStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setIsStreaming(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Failed to connect");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        const lines = textBuffer.split("\n");
        textBuffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) upsertAssistant(delta);
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "My brain is taking a quick nap! 💤 Please try again in a moment." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  // Dynamic chat container height based on viewport (keyboard-aware)
  const chatHeight = viewportHeight ? Math.min(360, viewportHeight - 200) : 360;

  return (
    <div className="space-y-3">
      <LoadingButton
        variant="default"
        className="w-full rounded-2xl text-base py-6 font-display gap-2"
        onClick={() => setIsOpen((v) => !v)}
      >
        💬 Need help? Chat with your AI Study Buddy!
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </LoadingButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <Card className="border-2 border-secondary/20 rounded-2xl overflow-hidden">
              <CardHeader className="py-3 px-4 bg-secondary/5">
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Bot className="w-5 h-5 text-secondary" />
                  Ask Owl for Help 🦉
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col" style={{ height: chatHeight }}>
                <ScrollArea className="flex-1 px-3 py-2" ref={scrollRef as any}>
                  {messages.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8 font-display">
                      Ask me anything about your homework! 📚
                    </p>
                  )}
                  <div className="space-y-3">
                    {messages.map((m, i) => (
                      <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                        {m.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                            <Bot className="w-4 h-4 text-secondary" />
                          </div>
                        )}
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 max-w-[80%] text-base",
                          m.role === "user" ? "bg-accent/10 text-foreground" : "bg-secondary/10 text-foreground"
                        )}>
                          {m.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none [&>p]:m-0">
                              <ReactMarkdown>{m.content}</ReactMarkdown>
                            </div>
                          ) : m.content}
                        </div>
                      </div>
                    ))}
                    {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                      <div className="flex justify-start">
                        <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Bot className="w-4 h-4 text-secondary" />
                        </div>
                        <div className="bg-secondary/10 rounded-2xl px-4 py-2.5 text-base text-muted-foreground">
                          <span className="inline-flex gap-1">
                            typing
                            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Image preview */}
                {imagePreview && (
                  <div className="px-3 py-2 border-t border-border flex items-center gap-2">
                    <img src={imagePreview} alt="Upload preview" className="w-12 h-12 rounded-lg object-cover border border-border" />
                    <span className="text-xs text-muted-foreground flex-1">Photo ready to send</span>
                    <button onClick={() => setImagePreview(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="border-t border-border p-3 flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <LoadingButton
                    size="icon"
                    variant="outline"
                    className="rounded-full shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isStreaming}
                  >
                    <Camera className="w-4 h-4" />
                  </LoadingButton>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Type or speak your question..."
                    className="rounded-full text-base"
                    disabled={isStreaming}
                  />
                  <LoadingButton
                    size="icon"
                    className={cn("rounded-full shrink-0", isListening && "bg-destructive hover:bg-destructive/90 animate-pulse")}
                    onClick={toggleListening}
                    disabled={isStreaming}
                  >
                    <Mic className="w-4 h-4" />
                  </LoadingButton>
                  <LoadingButton
                    size="icon"
                    className="rounded-full shrink-0"
                    onClick={sendMessage}
                    disabled={isStreaming || (!input.trim() && !imagePreview)}
                    isLoading={isStreaming}
                  >
                    <Send className="w-4 h-4" />
                  </LoadingButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
