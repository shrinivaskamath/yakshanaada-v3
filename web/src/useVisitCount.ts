import { useEffect, useState } from 'react';

// Free, no-backend hit counter (https://abacus.jasoncameron.dev).
// /hit increments and returns the new total; the counter is auto-created on the
// first request. This counts page loads, so it is higher / less precise than
// the GA4 visitor stats - it's a vanity counter, not an analytics source.
const NAMESPACE = 'yakshanaada-v3';
const KEY = 'visits';
const ENDPOINT = `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/${KEY}`;

// Module-level guard so we increment only once per page load even though React
// StrictMode runs effects twice in development.
let counted = false;
let cachedValue: number | null = null;

export function useVisitCount(): number | null {
  const [count, setCount] = useState<number | null>(cachedValue);

  useEffect(() => {
    if (counted) {
      if (cachedValue != null) setCount(cachedValue);
      return;
    }
    counted = true;

    const controller = new AbortController();
    fetch(ENDPOINT, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { value: number }) => {
        cachedValue = data.value;
        setCount(data.value);
      })
      .catch(() => {
        // Counter service unavailable / blocked; leave it hidden.
        counted = false;
      });

    return () => controller.abort();
  }, []);

  return count;
}
