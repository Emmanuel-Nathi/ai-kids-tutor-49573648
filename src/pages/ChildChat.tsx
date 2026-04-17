import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useRequireChildSession } from "@/hooks/useChildSession";
import { childApi } from "@/lib/childApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OwlMascot } from "@/components/OwlMascot";
import { Sparkle } from "@/components/Sparkle";
import { Send } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { useConfetti } from "@/hooks/useConfetti";
import { FeedbackButton } from "@/components/FeedbackButton";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChildChat() {
  const { childId } = useParams<{ childId: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const subject = searchParams.get("subject") || "general";
  const contextQuestion = searchParams.get("context");
  const missionId = searchParams.get("mission");
  const objectivesParam = searchParams.get("objectives");
  useRequireChildSession();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [childGrade, setChildGrade] = useState("");
  const [childCurrLevel, setChildCurrLevel] = useState("");
  const [childCurriculum, setChildCurriculum] = useState("cambridge");
  const [childLanguage, setChildLanguage] = useState("english");
  const [userMsgCount, setUserMsgCount] = useState(0);
  const [sessionStart] = useState(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contextSent = useRef(false);
  const { fireConfetti } = useConfetti();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (childId) {
      childApi.getChild(childId).then(({ data }) => {
        if (data) {
          setChildGrade(data.grade);
          setChildCurrLevel(data.curriculum_level);
          setChildCurriculum(data.selected_curriculum || "cambridge");
          setChildLanguage(data.preferred_language || "english");
        }
      });
    }
  }, [childId]);

  useEffect(() => {
    if (contextQuestion && !contextSent.current && childGrade) {
      contextSent.current = true;
      setInput(`Help me with this: ${contextQuestion}`);
      setTimeout(() => {
        sendMessageWithText(`Help me with this: ${contextQuestion}`);
      }, 500);
    }
  }, [contextQuestion, childGrade]);

  const saveMessage = async (role: string, content: string) => {
    if (!sessionId || !childId) return;
    await childApi.saveMessage(childId, sessionId, role, content);
  };

  const awardXP = async (amount: number, reason: string) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ child_id: childId, amount, reason }),
      });
      toast.success(`+${amount} XP! ⭐`, { duration: 2000 });
      fireConfetti();
    } catch {}
  };

  const sendMessageWithText = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const newCount = userMsgCount + 1;
    setUserMsgCount(newCount);

    if (newCount === 1) {
      window.posthog?.capture('chat_session_started', { child_id: childId, subject });
      window.gtag?.('event', 'chat_session_start', { subject });
    }

    await saveMessage("user", text.trim());

    if (newCount % 3 === 0) {
      const elapsedMs = Date.now() - sessionStart;
      const MIN_TIME_MS = 3 * 60 * 1000;
      if (elapsedMs < MIN_TIME_MS) {
        const remaining = Math.ceil((MIN_TIME_MS - elapsedMs) / 1000);
        toast("Whoa there, Speedster! 🏎️", {
          description: `Keep learning for ${remaining} more seconds to earn your XP!`,
          duration: 4000,
        });
      } else {
        awardXP(5, `💬 Asked ${newCount} questions in ${subject}`);
      }
    }

    let assistantSoFar = "";

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tutor`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          subject,
          childId,
          grade: childGrade,
          curriculum_level: childCurrLevel,
          curriculum: childCurriculum,
          preferred_language: childLanguage,
          ...(objectivesParam ? { activity_objectives: JSON.parse(decodeURIComponent(objectivesParam)) } : {}),
        }),
      });

      if (resp.status === 429) { toast.error("Too many requests. Please wait a moment."); setIsStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setIsStreaming(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Failed to connect to tutor");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantSoFar) {
        await saveMessage("assistant", assistantSoFar);
        const celebrationWords = ["brilliant", "correct", "well done", "great job", "amazing", "fantastic", "🌟", "🎉", "excellent", "xp", "points"];
        if (celebrationWords.some((w) => assistantSoFar.toLowerCase().includes(w))) {
          setShowCelebrate(true);
          setTimeout(() => setShowCelebrate(false), 1500);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const sendMessage = () => sendMessageWithText(input);

  const subjectEmoji: Record<string, string> = {
    math: "🔢", english: "📖", science: "🔬", general: "🌍",
    life_orientation: "🧭", natural_sciences: "🌿",
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <span className="font-display font-bold text-lg">
          {subjectEmoji[subject] || "📚"} {subject.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} Tutor
        </span>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <OwlMascot size="lg" variant="idle" pose="listen" message={`Ask me anything about ${subject.replace(/_/g, " ")}! I'll help you think through it 🤔`} />
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
            {msg.role === "assistant" && (
              <div className="shrink-0 mt-1 relative">
                <OwlMascot size="sm" animate={false} />
                <Sparkle active={showCelebrate && i === messages.length - 1} count={3} />
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border rounded-tl-sm"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2">
            <OwlMascot size="sm" variant="thinking" pose="listen" />
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <span className="animate-pulse text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card p-3 shrink-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 max-w-2xl mx-auto">
          <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." className="flex-1 rounded-full" disabled={isStreaming} />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={isStreaming || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
      <FeedbackButton childId={childId} />
    </div>
  );
}
