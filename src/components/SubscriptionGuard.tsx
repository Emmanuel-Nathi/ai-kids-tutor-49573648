import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function SubscriptionGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("created_at, subscription_status")
        .eq("user_id", user.id)
        .single();

      if (!data) {
        setAllowed(true);
        setChecking(false);
        return;
      }

      if (data.subscription_status === "active") {
        setAllowed(true);
        setChecking(false);
        return;
      }

      const createdAt = new Date(data.created_at);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCreation > 30) {
        navigate("/paywall");
      } else {
        setAllowed(true);
      }
      setChecking(false);
    };

    check();
  }, [user, authLoading, navigate]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return allowed ? <>{children}</> : null;
}
