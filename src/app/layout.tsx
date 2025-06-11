import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/navbar";
import { signOutAction } from "@/components/ui/server-actions";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "EchoBrief - Report LLM Voice Assistant",
  description:
    "EchoBrief is a voice assistant for your reports, powered by LLMs. Upload your reports and get them read and explained by AI.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className=" min-h-screen w-full !bg-black !text-white antialiased">
        <Navbar session={session} signOutAction={signOutAction} />
        {children}
      </body>
    </html>
  );
}
