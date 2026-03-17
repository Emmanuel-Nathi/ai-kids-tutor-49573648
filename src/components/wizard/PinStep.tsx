import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface PinStepProps {
  pin: string;
  setPin: (pin: string) => void;
}

export function PinStep({ pin, setPin }: PinStepProps) {
  const handleDigit = (d: string) => {
    if (pin.length < 4) setPin(pin + d);
  };
  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <div className="space-y-4">
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
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <Button key={d} variant="outline" size="lg" className="text-xl font-display h-14" onClick={() => handleDigit(String(d))}>
            {d}
          </Button>
        ))}
        <div />
        <Button variant="outline" size="lg" className="text-xl font-display h-14" onClick={() => handleDigit("0")}>
          0
        </Button>
        <Button variant="ghost" size="lg" className="h-14" onClick={handleDelete}>
          <Delete className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
