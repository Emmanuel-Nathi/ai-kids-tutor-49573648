import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OwlMascot } from "@/components/OwlMascot";
import { toast } from "sonner";
import { Delete, ArrowRight } from "lucide-react";

export default function ChildLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKey = (key: number) => {
    if (pin.length < 4) setPin((p) => p + key);
  };

  const handleClear = () => setPin("");

  const handleGo = async () => {
    if (pin.length !== 4) return;
    setLoading(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/child-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ pin }),
        }
      );

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Login failed");

      toast.success(`Welcome, ${data.name}! 🎉`);
      navigate(`/child/${data.child_id}`);
    } catch (err: any) {
      toast.error(err.message || "Wrong PIN. Try again! 🤔");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const stars = Array.from({ length: 4 }, (_, i) => (i < pin.length ? "⭐" : "☆"));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      <div className="w-full max-w-xs space-y-6">
        <OwlMascot size="lg" message="Enter your secret PIN! 🔒" className="mx-auto" />

        <h1 className="font-display text-2xl font-bold text-center text-foreground">
          Kid Login
        </h1>

        {/* PIN stars display */}
        <div className="flex justify-center gap-3 text-4xl select-none" aria-label={`${pin.length} of 4 digits entered`}>
          {stars.map((s, i) => (
            <span key={i} className="transition-transform duration-150" style={{ transform: i < pin.length ? "scale(1.2)" : "scale(1)" }}>
              {s}
            </span>
          ))}
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Button
              key={n}
              variant="outline"
              className="h-16 text-2xl font-display font-bold rounded-2xl border-2 hover:bg-primary/10 hover:border-primary active:scale-95 transition-all"
              onClick={() => handleKey(n)}
              disabled={loading || pin.length >= 4}
            >
              {n}
            </Button>
          ))}

          {/* Clear */}
          <Button
            variant="outline"
            className="h-16 text-lg font-display rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
            onClick={handleClear}
            disabled={loading}
          >
            <Delete className="w-6 h-6" />
          </Button>

          {/* 0 */}
          <Button
            variant="outline"
            className="h-16 text-2xl font-display font-bold rounded-2xl border-2 hover:bg-primary/10 hover:border-primary active:scale-95 transition-all"
            onClick={() => handleKey(0)}
            disabled={loading || pin.length >= 4}
          >
            0
          </Button>

          {/* Go */}
          <Button
            className="h-16 text-lg font-display font-bold rounded-2xl active:scale-95 transition-all"
            onClick={handleGo}
            disabled={loading || pin.length !== 4}
          >
            {loading ? "..." : <ArrowRight className="w-6 h-6" />}
          </Button>
        </div>

        <Button variant="link" className="w-full text-muted-foreground" onClick={() => navigate("/auth")}>
          Parent Login Instead
        </Button>
        <Button variant="link" className="w-full text-muted-foreground text-xs" onClick={() => navigate("/")}>
          ← Back to Website
        </Button>
      </div>
    </div>
  );
}
