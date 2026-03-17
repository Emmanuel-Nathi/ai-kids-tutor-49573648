import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8"];

interface GradeStepProps {
  grade: string;
  setGrade: (grade: string) => void;
}

export function GradeStep({ grade, setGrade }: GradeStepProps) {
  return (
    <div className="space-y-3">
      <Label className="text-center block">Select Grade</Label>
      <div className="grid grid-cols-4 gap-3">
        {GRADES.map((g) => (
          <Button
            key={g}
            variant={grade === g ? "default" : "outline"}
            className={`h-14 text-lg font-display ${
              grade === g ? "" : "hover:border-primary/30"
            }`}
            onClick={() => setGrade(g)}
          >
            {g}
          </Button>
        ))}
      </div>
    </div>
  );
}
