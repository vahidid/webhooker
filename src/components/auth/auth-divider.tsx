import { Separator } from "@/components/ui/separator";

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = "or continue with" }: AuthDividerProps) {
  return (
    <div className="relative flex items-center gap-4 py-2">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {text}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
