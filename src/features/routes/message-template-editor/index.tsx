"use client";

import { useMemo, useState } from "react";
import { getPayloadFieldsForProvider, type PayloadField } from "@/lib/providers";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface MessageTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  providerName?: string;
  eventType?: string;
  placeholder?: string;
  className?: string;
}

export function MessageTemplateEditor({
  value,
  onChange,
  providerName,
  eventType,
  placeholder,
  className,
}: MessageTemplateEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fields = useMemo<PayloadField[]>(
    () => providerName 
      ? getPayloadFieldsForProvider(providerName, eventType ? [eventType] : []) 
      : [],
    [providerName, eventType]
  );

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("font-mono", className)}
        rows={8}
      />

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>Use Handlebars syntax: {"{{payload.field}}"}</span>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="xs">
              View available variables
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Available payload variables</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-auto pr-2">
              <div className="space-y-2">
                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {!providerName 
                      ? "Select an endpoint to see available payload fields."
                      : !eventType
                        ? "Select an event type to see available payload fields."
                        : "No payload fields defined for this event type."
                    }
                  </p>
                )}
                {fields.map((field) => (
                  <div
                    key={field.path}
                    className="rounded-lg border bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-semibold text-primary">
                        {"{{"}payload.{field.path}{"}}"}
                      </code>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {field.type}
                      </span>
                    </div>
                    {field.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {field.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
