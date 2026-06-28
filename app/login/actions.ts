"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/constants";

export type LoginState = { error: string | null };

// Action serveur appelée quand Adrien soumet le formulaire de login.
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (password !== process.env.APP_PASSWORD) {
    return { error: "Mot de passe incorrect." };
  }

  // Mot de passe bon : on pose un cookie de session valable 1 an
  cookies().set(SESSION_COOKIE, process.env.AUTH_COOKIE_SECRET ?? "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/");
}
