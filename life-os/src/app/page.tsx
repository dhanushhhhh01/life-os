"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthScreen } from "@/components/AuthScreen";

export default function Home() {
  const { loggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loggedIn) {
      router.push("/dashboard");
    }
  }, [loggedIn, router]);

  if (loggedIn) return null;
  return <AuthScreen />;
}
