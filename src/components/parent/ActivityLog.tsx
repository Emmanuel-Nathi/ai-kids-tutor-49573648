import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { format } from "date-fns";
import { ActivityLogItem } from "@/hooks/useSessionHistory";

interface ActivityLogProps {
  items: ActivityLogItem[];
  title: string;
  maxItems?: number;
  showDate?: boolean;
  icon?: React.ReactNode;
  badgeCount?: number;
}

export function ActivityLog({ items, title, maxItems, showDate = false, icon, badgeCount }: ActivityLogProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-base flex items-center gap-2">
          {icon || <Zap className="w-4 h-4 text-primary" />} {title}
          {badgeCount != null && badgeCount > 0 && (
            <Badge variant="secondary" className="ml-auto">{badgeCount} events</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {displayItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {showDate
                    ? format(new Date(item.timestamp), "MMM d, HH:mm")
                    : format(new Date(item.timestamp), "HH:mm")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
