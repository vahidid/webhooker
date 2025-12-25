"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SpinnerGap, Buildings, Link as LinkIcon, Users, CheckCircle, XCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import {
  createOrganizationSchema,
  type CreateOrganizationFormData,
} from "@/lib/validations/organization";
import { createOrganization, checkSlugAvailability } from "@/lib/actions/organization";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const teamSizeOptions = [
  { value: "1", label: "Just me" },
  { value: "2", label: "2-5 members" },
  { value: "6", label: "6-10 members" },
  { value: "11", label: "11-25 members" },
  { value: "26", label: "26-50 members" },
  { value: "51", label: "51-100 members" },
  { value: "101", label: "100+ members" },
];

interface CreateOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateOrganizationModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrganizationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      memberCount: 1,
    },
  });

  const name = watch("name");
  const slug = watch("slug");

  // Auto-generate slug from name
  useEffect(() => {
    if (name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", generatedSlug);
    }
  }, [name, slug, setValue]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus("checking");
      const result = await checkSlugAvailability(slug);
      setSlugStatus(result.available ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const onSubmit = async (data: CreateOrganizationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createOrganization(data);

      if (result.success) {
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Create organization error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (!newOpen) {
        reset();
        setError(null);
        setSlugStatus("idle");
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showClose={!isLoading}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Buildings className="size-6 text-primary" weight="duotone" />
          </div>
          <DialogTitle className="text-center">Create Organization</DialogTitle>
          <DialogDescription className="text-center">
            Set up your organization to start using Webhooker
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <div className="relative">
              <Buildings
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                weight="duotone"
              />
              <Input
                id="name"
                placeholder="Acme Inc."
                className="h-11 pl-10"
                disabled={isLoading}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Slug Field */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="relative">
              <LinkIcon
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                weight="duotone"
              />
              <Input
                id="slug"
                placeholder="acme-inc"
                className={cn(
                  "h-11 pl-10 pr-10",
                  slugStatus === "taken" && "border-destructive focus-visible:border-destructive",
                  slugStatus === "available" && "border-green-500 focus-visible:border-green-500"
                )}
                disabled={isLoading}
                {...register("slug")}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {slugStatus === "checking" && (
                  <SpinnerGap className="size-4 animate-spin text-muted-foreground" />
                )}
                {slugStatus === "available" && (
                  <CheckCircle className="size-4 text-green-500" weight="fill" />
                )}
                {slugStatus === "taken" && (
                  <XCircle className="size-4 text-destructive" weight="fill" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              webhooker.app/<span className="font-medium">{slug || "your-slug"}</span>
            </p>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
            {slugStatus === "taken" && !errors.slug && (
              <p className="text-xs text-destructive">This slug is already taken</p>
            )}
          </div>

          {/* Member Count Field */}
          <div className="space-y-2">
            <Label htmlFor="memberCount">Expected Team Size</Label>
            <div className="relative">
              <Users
                className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
                weight="duotone"
              />
              <Select
                disabled={isLoading}
                defaultValue="1"
                onValueChange={(value) => setValue("memberCount", parseInt(value, 10))}
              >
                <SelectTrigger id="memberCount" className="h-11 pl-10">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.memberCount && (
              <p className="text-xs text-destructive">{errors.memberCount.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || slugStatus === "taken" || slugStatus === "checking"}
            >
              {isLoading ? (
                <>
                  <SpinnerGap className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
