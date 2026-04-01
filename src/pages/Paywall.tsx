import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { OwlMascot } from "@/components/OwlMascot";

export default function Paywall() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { user } = useAuth();

  const handlePayfastCheckout = () => {
    setIsRedirecting(true);

    // TODO: PRODUCTION — Replace sandbox credentials with live values before go-live.
    // Move to an edge function to avoid exposing merchant keys client-side.
    const merchantId = "10000100"; // Sandbox — swap for production merchant_id
    const merchantKey = "46f0cd694581a"; // Sandbox — swap for production merchant_key
    const payfastUrl = "https://sandbox.payfast.co.za/eng/process"; // Swap to https://www.payfast.co.za/eng/process

    const paymentData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${window.location.origin}/parent?payment=success`,
      cancel_url: `${window.location.origin}/paywall?payment=cancelled`,
      notify_url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-webhook`,
      email_address: user?.email || "",
      m_payment_id: user?.id || "",
      amount: "199.99",
      item_name: "AI Kids Tutor Monthly Subscription",
      subscription_type: "1",
      frequency: "3",
      cycles: "0",
      recurring_amount: "199.99",
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = payfastUrl;

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const features = [
    "Unlimited CAPS, IEB & Cambridge Activities",
    "Parent Dashboard & Analytics",
    "Custom Rewards & Privilege Store",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <OwlMascot size="md" className="mx-auto mb-2" />
          <CardTitle className="font-display text-2xl">Unlock Full Access</CardTitle>
          <CardDescription>
            Your 30-day trial has expired, or you are adding a second child. Subscribe to continue!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-primary">R 199.99</p>
            <p className="text-sm text-muted-foreground">per month, cancel anytime.</p>
          </div>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full font-display gap-2"
            size="lg"
            onClick={handlePayfastCheckout}
            disabled={isRedirecting}
          >
            <ShieldCheck className="h-5 w-5" />
            {isRedirecting ? "Connecting securely..." : "Subscribe with Payfast"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
