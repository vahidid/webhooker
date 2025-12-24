"use client";

import * as React from "react";
import { Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, type, showPasswordToggle, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
        </Label>
        <div className="relative">
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              "h-11 pr-10",
              error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
          {showPasswordToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlash className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <WarningCircle className="size-3.5" weight="fill" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
