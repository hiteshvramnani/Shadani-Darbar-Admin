const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const BUCKET = "media";

export async function uploadToSupabase(file, folder) {
  const ext = file.name.split(".").pop();
  const filename = `${folder}/${Date.now()}.${ext}`;
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": file.type,
        "x-upsert": "true",
        apikey: SUPABASE_KEY,
      },
      body: file,
    },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Upload failed (${res.status})`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}
