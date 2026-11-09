import { useCallback, useEffect, useState } from "react";
import { getUsage } from "../api/services/usageService";

// The "used / allowed today" numbers for the forms. The numbers are only a hint (the server enforces the limits),
// so a failed load just shows nothing. Call refresh() after an action that may have used some of the allowance.
export const useUsage = () => {
  const [usage, setUsage] = useState(null);
  const refresh = useCallback(() => getUsage().then((res) => setUsage(res?.data || null)).catch(() => {}), []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { usage, refresh };
};
