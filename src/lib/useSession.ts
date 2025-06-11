/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        setSession(data && data.user ? data : null);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  return { session, loading };
}
