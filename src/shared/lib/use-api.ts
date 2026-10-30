import { useEffect, useState } from "react";
import { api } from "@/shared/api/client";

export function useApi<T>(url: string | null) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({
    loading: !!url,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setState((s) => ({ ...s, error: undefined, loading: true }));
    api<T>(url)
      .then((data) => !cancelled && setState({ data, loading: false }))
      .catch((e: Error) => !cancelled && setState({ error: e.message, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [url, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
