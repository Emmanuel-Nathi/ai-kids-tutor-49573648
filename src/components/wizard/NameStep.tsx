import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameStepProps {
  name: string;
  setName: (name: string) => void;
  onNext: () => void;
}

export function NameStep({ name, setName, onNext }: NameStepProps) {
  return (
    <div className="space-y-2">
      <Label>Child's First Name</Label>
      <Input
        autoFocus
        placeholder="e.g. Sarah"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && name.trim().length > 0 && onNext()}
      />
    </div>
  );
}
