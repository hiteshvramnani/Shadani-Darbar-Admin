const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

export async function fetchConfig() {
  const res = await fetch(`${WORKER_URL}/api/config`);
  const data = await res.json();
  return data.config || {};
}

export async function saveConfig(partial) {
  const res = await fetch(`${WORKER_URL}/api/admin/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_SECRET}`,
    },
    body: JSON.stringify(partial),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save");
  return data;
}
