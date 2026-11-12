"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, errorMessage } from "@/lib/api";
import type { Player } from "@/lib/types";
export function useSession() {
  const [user, setUser] = useState<Player | null>(null),
    [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => {
    let active = true;
    api<Player>("/auth/me")
      .then((value) => {
        if (active) setUser(value);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401)
          router.replace("/auth");
        else setError(errorMessage(err));
      });
    return () => {
      active = false;
    };
  }, [router]);
  return { user, setUser, error };
}
