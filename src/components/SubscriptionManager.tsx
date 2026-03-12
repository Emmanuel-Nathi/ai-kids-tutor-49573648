import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { addDays, format, isPast } from "date-fns";

export function SubscriptionManager() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("trial");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("subscription_status, created_at")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setStatus(data.subscription_status);
          setCreatedAt(data.created_at);
        }
        setLoading(false);
      });
  }, [user]);

  const cancelSubscription = async () => {
    if (!user) return;
    setCancelling(true);
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_status: "cancelled" })
      .eq("user_id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      setStatus("cancelled");
      toast.success("Subscription cancelled. You can manage billing at payfast.co.za/eng/manage");
    }
    setCancelling(false);
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const trialEndDate = createdAt ? addDays(new Date(createdAt), 30) : null;
  const trialExpired = trialEndDate ? isPast(trialEndDate) : false;

  const statusBadge = {
    active: <Badge className="bg-accent text-accent-foreground">Active</Badge>,
    trial: <Badge variant="secondary">{trialExpired ? "Trial Expired" : "Trial"}</Badge>,
    cancelled: <Badge variant="destructive">Cancelled</Badge>,
  }[status] || <Badge variant="outline">{status}</Badge>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" /> Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          {statusBadge}
        </div>

        {trialEndDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Trial End Date
            </span>
            <span className="text-sm text-muted-foreground">
              {format(trialEndDate, "dd MMM yyyy")}
            </span>
          </div>
        )}

        {status === "trial" && trialExpired && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Your trial has expired. Subscribe to continue using the app.
          </div>
        )}

        {status === "active" && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              R199.99/month · Cancel anytime
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={cancelSubscription}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </div>
        )}

        {(status === "cancelled" || (status === "trial" && trialExpired)) && (
          <Button
            className="w-full"
            onClick={() => window.location.href = "/paywall"}
          >
            Subscribe — R199.99/month
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
