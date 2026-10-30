import { useEffect, useState } from "react";
import { todayISO } from "./date";

/** null during prerender/first render, then today's date in the app timezone. */
export function useToday() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayISO()), []);
  return today;
}
