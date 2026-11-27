"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Recharge les données de la page toutes les `everyMs` ms, `times` fois au maximum. */
export function AutoRefresh({ everyMs = 4000, times = 15 }: { everyMs?: number; times?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= times) clearInterval(id);
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, times]);
  return null;
}
