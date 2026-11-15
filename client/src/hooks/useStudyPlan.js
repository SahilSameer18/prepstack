import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { getPlan } from "../api/services/planService";
import { extractError } from "../utils/extractError";

// One owner-scoped source of truth. Every successful write reloads the server's projections.
export function useStudyPlan(enabled = true) {
  const { user } = useAuth();
  const owner = user?.id || user?._id;
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const request = useRef(0);
  const writing = useRef(false);

  const reload = useCallback(async () => {
    const version = ++request.current;
    try {
      const data = await getPlan();
      if (version === request.current) setState({ owner, data });
      return true;
    } catch (error) {
      if (version === request.current)
        setState({ owner, error: extractError(error) });
      return false;
    }
  }, [owner]);

  useEffect(() => {
    if (!enabled) return;
    reload();
    return () => {
      request.current += 1;
    };
  }, [reload, enabled]);

  // Serialize actions to avoid double clicks and keep a failed save on its current screen.
  async function runAction(action) {
    if (writing.current) return null;
    writing.current = true;
    setBusy(true);
    setActionError("");
    try {
      const result = await action();
      await reload();
      return result;
    } catch (error) {
      setActionError(extractError(error));
      return null;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  const current = state?.owner === owner ? state : null;
  return {
    data: current?.data,
    error: current?.error,
    loading: !current,
    busy,
    actionError,
    reload,
    runAction,
    clearActionError: () => setActionError(""),
  };
}
