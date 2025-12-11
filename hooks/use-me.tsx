import { useEffect, useState } from "react";

export const useMe = (): { meId: string | null; isLoading: boolean } => {
  const [meId, setMeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/search/me");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setMeId(json.id ?? null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { meId, isLoading };
};
