const WORKER_URL   = import.meta.env.VITE_WORKER_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

let adminCachedConfig   = null;
let adminCacheTimestamp = null;
const CACHE_TTL_MS      = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
  return adminCachedConfig !== null &&
    (Date.now() - adminCacheTimestamp) < CACHE_TTL_MS;
}

export async function fetchConfig() {
  if (isCacheValid()) return adminCachedConfig;

  const res  = await fetch(`${WORKER_URL}/api/config`);
  const data = await res.json();
  adminCachedConfig   = data.config || {};
  adminCacheTimestamp = Date.now();
  return adminCachedConfig;
}

export async function saveConfig(partial) {
  const res = await fetch(`${WORKER_URL}/api/admin/config`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${ADMIN_SECRET}`,
    },
    body: JSON.stringify(partial),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save");

  // Bust cache so next fetchConfig() gets fresh data from worker
  adminCachedConfig   = null;
  adminCacheTimestamp = null;

  return data;
}