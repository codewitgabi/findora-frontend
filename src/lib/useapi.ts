import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "./api";

interface Result<T> {
  key: string;
  data?: T;
  error?: string;
}

/**
 * Runs `fetcher` whenever `key` changes and keeps the previous data on screen while the
 * next request is in flight. `mutate` edits the cached data locally, `reload` refetches.
 */
export function useApi<T>(fetcher: () => Promise<T>, key: string) {
  const [reloads, setReloads] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const requestKey = `${key}#${reloads}`;

  useEffect(() => {
    let cancelled = false;
    fetcher().then(
      (data) => {
        if (!cancelled) setResult({ key: requestKey, data });
      },
      (cause) => {
        if (!cancelled) setResult({ key: requestKey, error: errorMessage(cause, "Something went wrong. Please try again.") });
      },
    );
    return () => {
      cancelled = true;
    };
    // `fetcher` is a fresh closure every render; `requestKey` already encodes its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const current = result?.key === requestKey ? result : null;
  const data = current?.data ?? result?.data;
  const reload = useCallback(() => setReloads((count) => count + 1), []);
  const mutate = useCallback((update: (previous: T) => T) => {
    setResult((previous) => (previous?.data === undefined ? previous : { ...previous, data: update(previous.data) }));
  }, []);

  return { data, error: current?.error, loading: !current && data === undefined, reload, mutate };
}
