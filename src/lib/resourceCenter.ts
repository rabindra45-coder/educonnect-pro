import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "digital-resources";

export interface ResourceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface DigitalResource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  file_url: string;
  cover_image_url: string | null;
  subject: string | null;
  class: string | null;
  author: string | null;
  publisher: string | null;
  is_downloadable: boolean;
  access_level: string;
  view_count: number;
  download_count: number;
  uploaded_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_id: string | null;
  folder_id: string | null;
  file_name: string | null;
  file_size: number | null;
  file_mime: string | null;
  storage_path: string | null;
  tags: string[] | null;
  is_featured: boolean | null;
  is_archived: boolean | null;
  deleted_at: string | null;
  ai_generated: boolean | null;
  ai_prompt: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  allowed_roles: string[] | null;
}

export async function getSignedUrl(path: string, expiresIn = 60 * 60) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn, { download: true });
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadResourceFile(file: File, prefix = "uploads") {
  const ext = file.name.split(".").pop() || "bin";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return { path, size: file.size, mime: file.type, name: file.name, ext };
}

export async function uploadBytes(
  bytes: Blob | ArrayBuffer | Uint8Array,
  filename: string,
  mime: string,
  prefix = "ai",
) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${prefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes as BlobPart], { type: mime });
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "3600",
    upsert: false,
    contentType: mime,
  });
  if (error) throw error;
  return { path, size: blob.size, mime, name: filename };
}

export async function recordDownload(resourceId: string) {
  const { data: u } = await supabase.auth.getUser();
  await supabase.from("resource_downloads").insert({
    resource_id: resourceId,
    user_id: u.user?.id ?? null,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  });
}

export async function downloadResource(r: Pick<DigitalResource, "id" | "storage_path" | "file_url" | "file_name" | "title">) {
  let url = r.file_url;
  if (r.storage_path) {
    url = await getSignedUrl(r.storage_path);
  }
  await recordDownload(r.id);
  const a = document.createElement("a");
  a.href = url;
  a.download = r.file_name || r.title;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function toggleFavorite(resourceId: string, userId: string) {
  const { data: existing } = await supabase
    .from("resource_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("resource_id", resourceId)
    .maybeSingle();
  if (existing) {
    await supabase.from("resource_favorites").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("resource_favorites").insert({ user_id: userId, resource_id: resourceId });
  return true;
}

export async function rateResource(resourceId: string, userId: string, rating: number, comment?: string) {
  await supabase
    .from("resource_ratings")
    .upsert({ user_id: userId, resource_id: resourceId, rating, comment: comment ?? null }, { onConflict: "user_id,resource_id" });
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${u[i]}`;
}

export function iconForType(mime?: string | null, type?: string | null): string {
  const m = (mime || "").toLowerCase();
  const t = (type || "").toLowerCase();
  if (m.startsWith("image/") || t.includes("image")) return "Image";
  if (m.startsWith("video/") || t.includes("video")) return "Video";
  if (m.startsWith("audio/") || t.includes("audio")) return "Music";
  if (m.includes("pdf") || t.includes("pdf")) return "FileText";
  if (m.includes("zip") || m.includes("compress")) return "Archive";
  if (m.includes("word") || m.includes("doc")) return "FileText";
  if (m.includes("sheet") || m.includes("excel")) return "FileSpreadsheet";
  if (m.includes("presentation") || m.includes("powerpoint")) return "Presentation";
  return "File";
}
