"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, SpinnerGap } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { signInSchema, type SignInFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/auth/form-field";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthDivider } from "@/components/auth/auth-divider";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      console.log("Sign in data:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Handle successful sign in
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/5">
      <CardHeader className="space-y-1 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Email/Password Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            error={errors.email?.message}
            disabled={isLoading}
            {...register("email")}
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            showPasswordToggle
            error={errors.password?.message}
            disabled={isLoading}
            {...register("password")}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
                disabled={isLoading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-11 font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <SpinnerGap className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="size-4" weight="bold" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Sign up link */}
        <motion.p
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Create one
          </Link>
        </motion.p>
      </CardContent>
    </Card>
  );
}
