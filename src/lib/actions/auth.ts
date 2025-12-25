"use server";

import { signIn, signOut } from "@/lib/auth";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function signInWithCredentials(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong" };
      }
    }
    throw error;
  }
}

export async function signUpWithCredentials(
  data: SignUpFormData
): Promise<AuthResult> {
  try {
    const validatedFields = signUpSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    const { name, email, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Sign in the user after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function signOutUser() {
  await signOut({ redirectTo: "/sign-in" });
}

export async function getCurrentUser() {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  return session?.user;
}
