import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { NameStep } from "@/components/wizard/NameStep";
import { CurriculumStep } from "@/components/wizard/CurriculumStep";
import { GradeStep } from "@/components/wizard/GradeStep";
import { PinStep } from "@/components/wizard/PinStep";

const TOTAL_STEPS = 4;

export function ChildSetupWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [grade, setGrade] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 2 ? !!curriculum :
    step === 3 ? !!grade :
    pin.length === 4;

  const owlMessage =
    step === 1 ? "What's your child's name?" :
    step === 2 ? "Which curriculum do they follow?" :
    step === 3 ? "What grade are they in?" :
    "Set a 4-digit PIN for them!";

  const handleComplete = async () => {
    if (!user || pin.length !== 4) return;
    setSaving(true);
    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: name.trim(),
      grade,
      selected_curriculum: curriculum,
      access_pin: pin,
    } as any);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${name} has been added! 🎉`);
      // Send child-added notification email (fire and forget)
      supabase.functions.invoke("send-child-added-email", {
        body: { child_name: name.trim(), grade, curriculum },
      }).catch(console.error);
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
          <OwlMascot size="md" animate className="mx-auto mb-2" message={owlMessage} />
          <CardTitle className="font-display text-xl">
            Step {step} of {TOTAL_STEPS}
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div key={s} className={`w-3 h-3 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && <NameStep name={name} setName={setName} onNext={() => canNext && setStep(2)} />}
          {step === 2 && <CurriculumStep curriculum={curriculum} setCurriculum={setCurriculum} />}
          {step === 3 && <GradeStep grade={grade} setGrade={setGrade} />}
          {step === 4 && <PinStep pin={pin} setPin={setPin} />}

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
            {step < TOTAL_STEPS ? (
              <Button className="flex-1" disabled={!canNext} onClick={() => {
                const nextStep = step + 1;
                setStep(nextStep);
                if (typeof window !== "undefined" && (window as any).posthog) {
                  (window as any).posthog.capture("onboarding_step_completed", { step, next_step: nextStep });
                }
              }}>
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
