// src/components/ui/server-actions.ts
"use server";
import { signOut, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function signOutAction() {
  await signOut();
}

export async function loginWithGoogle() {
  "use server";
  await signIn("google");
}

export async function uploadRedirect(formData: FormData) {
  "use server";
  const session = await auth();
  const isChat = formData.get("chat");
  if (isChat) {
    if (!session) {
      return redirect("/chat");
    } else {
      return redirect("/user/chat");
    }
  } else {
    if (!session) {
      return redirect("/upload");
    } else {
      return redirect("/user/upload");
    }
  }
}
