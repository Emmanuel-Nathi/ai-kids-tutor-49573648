import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { OwlMascot } from "@/components/OwlMascot";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

export default function ChildLogin() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || pin.length !== 4) return;
    setLoading(true);

    try {
      // Use edge function to validate child PIN (bypasses RLS)
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/child-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ name: name.trim(), pin }),
        }
      );

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Login failed");

      toast.success(`Welcome, ${data.name}! 🎉`);
      navigate(`/child/${data.child_id}`);
    } catch (err: any) {
      toast.error(err.message || "Could not log in. Check your name and PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <OwlMascot size="lg" message="Hi there! Enter your name and PIN 🦉" className="mx-auto mb-2" />
          <CardTitle className="font-display">Kid Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input
              placeholder="e.g. Sarah"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Your PIN</Label>
            <div className="flex justify-center">
              <InputOTP value={pin} onChange={setPin} maxLength={4}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading || !name.trim() || pin.length !== 4}
          >
            {loading ? "Logging in..." : "Let's Go! 🚀"}
          </Button>
          <Button variant="link" className="w-full" onClick={() => navigate("/auth")}>
            Parent Login Instead
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
