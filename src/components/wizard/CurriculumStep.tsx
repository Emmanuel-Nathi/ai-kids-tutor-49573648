import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Check } from "lucide-react";

const CURRICULUMS = [
  { value: "caps", label: "CAPS", description: "Public Schools (SA)" },
  { value: "ieb", label: "IEB", description: "Private Schools (SA)" },
  { value: "cambridge", label: "Cambridge", description: "International" },
];

interface CurriculumStepProps {
  curriculum: string;
  setCurriculum: (curriculum: string) => void;
}

export function CurriculumStep({ curriculum, setCurriculum }: CurriculumStepProps) {
  return (
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
  );
}
