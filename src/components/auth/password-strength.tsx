"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "@phosphor-icons/react";

interface PasswordStrengthProps {
  password: string;
}

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const passedCount = requirements.filter((req) => req.test(password)).length;
  const strengthPercentage = (passedCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage <= 25) return "bg-destructive";
    if (strengthPercentage <= 50) return "bg-orange-500";
    if (strengthPercentage <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strengthPercentage <= 25) return "Weak";
    if (strengthPercentage <= 50) return "Fair";
    if (strengthPercentage <= 75) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn(
              "font-medium",
              strengthPercentage <= 25 && "text-destructive",
              strengthPercentage > 25 && strengthPercentage <= 50 && "text-orange-500",
              strengthPercentage > 50 && strengthPercentage <= 75 && "text-yellow-500",
              strengthPercentage > 75 && "text-green-500"
            )}
          >
            {getStrengthText()}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-1.5 text-xs">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <li
              key={index}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                passed ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {passed ? (
                <Check className="size-3" weight="bold" />
              ) : (
                <X className="size-3" weight="bold" />
              )}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
