"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Buildings,
  SpinnerGap,
  ArrowRight,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  Users,
  Sparkle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

import {
  createOrganizationSchema,
  type CreateOrganizationFormData,
} from "@/lib/validations/organization";
import { createOrganization, checkSlugAvailability } from "@/lib/actions/organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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
    if (name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", generatedSlug);
    }
  }, [name, setValue]);

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
        router.push("/dashboard");
        router.refresh();
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-background via-background to-primary/5">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-80 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 size-80 animate-pulse rounded-full bg-primary/15 blur-3xl delay-1000" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
            W
          </div>
          <span className="text-xl font-semibold text-foreground">Webhooker</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkle className="size-8 text-primary" weight="duotone" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Let&apos;s set up your workspace
              </CardTitle>
              <CardDescription>
                Create your organization to start using Webhooker. You can invite team members later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <div className="relative">
                    <Buildings
                      className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                      weight="duotone"
                    />
                    <Input
                      id="name"
                      placeholder="Acme Inc."
                      className="h-12 pl-11 text-base"
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
                  <Label htmlFor="slug">Workspace URL</Label>
                  <div className="relative">
                    <LinkIcon
                      className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                      weight="duotone"
                    />
                    <Input
                      id="slug"
                      placeholder="acme-inc"
                      className={cn(
                        "h-12 pl-11 pr-11 text-base",
                        slugStatus === "taken" &&
                          "border-destructive focus-visible:border-destructive",
                        slugStatus === "available" &&
                          "border-green-500 focus-visible:border-green-500"
                      )}
                      disabled={isLoading}
                      {...register("slug")}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugStatus === "checking" && (
                        <SpinnerGap className="size-5 animate-spin text-muted-foreground" />
                      )}
                      {slugStatus === "available" && (
                        <CheckCircle className="size-5 text-green-500" weight="fill" />
                      )}
                      {slugStatus === "taken" && (
                        <XCircle className="size-5 text-destructive" weight="fill" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    webhooker.app/<span className="font-medium">{slug || "your-workspace"}</span>
                  </p>
                  {errors.slug && (
                    <p className="text-xs text-destructive">{errors.slug.message}</p>
                  )}
                  {slugStatus === "taken" && !errors.slug && (
                    <p className="text-xs text-destructive">This URL is already taken</p>
                  )}
                </div>

                {/* Member Count Field */}
                <div className="space-y-2">
                  <Label htmlFor="memberCount">How many people are on your team?</Label>
                  <div className="relative">
                    <Users
                      className="absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      weight="duotone"
                    />
                    <Select
                      disabled={isLoading}
                      defaultValue="1"
                      onValueChange={(value) => setValue("memberCount", parseInt(value, 10))}
                    >
                      <SelectTrigger id="memberCount" className="h-12 pl-11 text-base">
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
                  <p className="text-sm text-muted-foreground">
                    You can update this later as your team grows
                  </p>
                  {errors.memberCount && (
                    <p className="text-xs text-destructive">{errors.memberCount.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading || slugStatus === "taken" || slugStatus === "checking"}
                >
                  {isLoading ? (
                    <>
                      <SpinnerGap className="size-5 animate-spin" />
                      Creating workspace...
                    </>
                  ) : (
                    <>
                      Create Workspace
                      <ArrowRight className="size-5" weight="bold" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
