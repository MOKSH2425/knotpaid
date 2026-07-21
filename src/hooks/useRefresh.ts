import { useCallback, useState } from "react";
import { haptics } from "@/utils/haptics";

// Wraps a synchronous reload function with the refreshing state
// RefreshControl needs. Local SQLite reads are effectively instant, so we
// hold the spinner visible for a brief minimum duration — otherwise the
// pull gesture would flash and vanish before it registers as "did
// something happen."
export function useRefresh(reload: () => void, minDurationMs = 450) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    haptics.light();
    reload();
    setTimeout(() => setRefreshing(false), minDurationMs);
  }, [reload, minDurationMs]);

  return { refreshing, onRefresh };
}
