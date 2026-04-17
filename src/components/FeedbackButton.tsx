import { useState } from "react";
import { MessageSquarePlus, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/loading-button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackButtonProps {
  childId?: string;
  parentId?: string;
  className?: string;
}

const STAR_COUNT = [1, 2, 3, 4, 5];

export function FeedbackButton({ childId, parentId, className }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!message.trim()) {
      toast.error("Please share what's on your mind!");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({
      child_id: childId ?? null,
      parent_id: parentId ?? null,
      rating: rating || null,
      category: "beta",
      message: message.trim().slice(0, 2000),
      page_url: typeof window !== "undefined" ? window.location.pathname : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send feedback. Try again?");
      return;
    }
    toast.success("🦉 Thanks! Your feedback helps us improve.");
    setMessage("");
    setRating(0);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className={cn(
          "fixed bottom-4 right-4 z-40 rounded-full bg-primary text-primary-foreground shadow-lg p-3 hover:scale-105 active:scale-95 transition-transform",
          className,
        )}
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="font-display text-lg">Tell us how we're doing 🦉</CardTitle>
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-1 justify-center">
                    {STAR_COUNT.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={cn(
                          "text-3xl transition-transform hover:scale-110",
                          n <= rating ? "opacity-100" : "opacity-30",
                        )}
                        aria-label={`Rate ${n} stars`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What did you love? What's broken? What's missing?"
                    className="min-h-[100px] rounded-xl"
                    maxLength={2000}
                  />
                  <LoadingButton
                    onClick={submit}
                    isLoading={submitting}
                    className="w-full font-display rounded-full"
                  >
                    <Send className="w-4 h-4" />
                    Send feedback
                  </LoadingButton>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
