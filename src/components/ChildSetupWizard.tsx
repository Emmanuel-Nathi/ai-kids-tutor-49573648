import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, ArrowRight, Check, BookOpen, Delete } from "lucide-react";
import { toast } from "sonner";

const CURRICULUMS = [
  { value: "caps", label: "CAPS", description: "Public Schools (SA)" },
  { value: "ieb", label: "IEB", description: "Private Schools (SA)" },
  { value: "cambridge", label: "Cambridge", description: "International" },
];

export function ChildSetupWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  const canNext = step === 1 ? name.trim().length > 0 : step === 2 ? !!curriculum : pin.length === 4;

  const handleComplete = async () => {
    if (!user || pin.length !== 4) return;
    setSaving(true);
    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: name.trim(),
      grade: "1",
      selected_curriculum: curriculum,
      access_pin: pin,
    } as any);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${name} has been added! 🎉`);
      navigate("/parent");
    }
  };

  const handlePinDigit = (d: string) => {
    if (pin.length < 4) setPin(pin + d);
  };
  const handlePinDelete = () => setPin(pin.slice(0, -1));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <OwlMascot size="md" animate className="mx-auto mb-2" message={
            step === 1 ? "What's your child's name?" :
            step === 2 ? "Which curriculum do they follow?" :
            "Set a 4-digit PIN for them!"
          } />
          <CardTitle className="font-display text-xl">
            Step {step} of 3
          </CardTitle>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-3 h-3 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-2">
              <Label>Child's First Name</Label>
              <Input
                autoFocus
                placeholder="e.g. Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canNext && setStep(2)}
              />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              {CURRICULUMS.map((c) => (
                <Card
                  key={c.value}
                  className={`cursor-pointer transition-all border-2 ${
                    curriculum === c.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/30"
                  }`}
                  onClick={() => setCurriculum(c.value)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      curriculum === c.value ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-display font-bold">{c.label}</p>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    </div>
                    {curriculum === c.value && <Check className="w-5 h-5 text-primary ml-auto" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* PIN display */}
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold font-display transition-all ${
                      pin[i] ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    {pin[i] ? "●" : ""}
                  </div>
                ))}
              </div>
              {/* Number pad */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <Button key={d} variant="outline" size="lg" className="text-xl font-display h-14" onClick={() => handlePinDigit(String(d))}>
                    {d}
                  </Button>
                ))}
                <div />
                <Button variant="outline" size="lg" className="text-xl font-display h-14" onClick={() => handlePinDigit("0")}>
                  0
                </Button>
                <Button variant="ghost" size="lg" className="h-14" onClick={handlePinDelete}>
                  <Delete className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 ? (
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" onClick={() => navigate("/parent")}>
                Cancel
              </Button>
            )}
            {step < 3 ? (
              <Button className="flex-1" disabled={!canNext} onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button className="flex-1" disabled={!canNext || saving} onClick={handleComplete}>
                {saving ? "Saving..." : "Complete Setup"} <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
