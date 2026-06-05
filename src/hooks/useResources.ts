import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { DigitalResource, ResourceCategory } from "@/lib/resourceCenter";
import { toggleFavorite, rateResource } from "@/lib/resourceCenter";

export interface ResourceFilters {
  search?: string;
  categoryId?: string | null;
  sort?: "newest" | "oldest" | "popular" | "rating";
  featured?: boolean;
  favoritesOnly?: boolean;
  uploadedBy?: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ["resource-categories"],
    queryFn: async (): Promise<ResourceCategory[]> => {
      const { data, error } = await supabase
        .from("resource_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data as ResourceCategory[]) ?? [];
    },
  });
}

export function useResources(filters: ResourceFilters = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["resources", filters, user?.id],
    queryFn: async (): Promise<DigitalResource[]> => {
      let q = supabase
        .from("digital_resources")
        .select("*")
        .eq("is_active", true)
        .is("deleted_at", null);

      if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
      if (filters.featured) q = q.eq("is_featured", true);
      if (filters.uploadedBy) q = q.eq("uploaded_by", filters.uploadedBy);
      if (filters.search) {
        const s = filters.search.replace(/[%,]/g, "");
        q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%,subject.ilike.%${s}%`);
      }
      switch (filters.sort) {
        case "oldest": q = q.order("created_at", { ascending: true }); break;
        case "popular": q = q.order("download_count", { ascending: false }); break;
        case "rating": q = q.order("rating_avg", { ascending: false }); break;
        default: q = q.order("created_at", { ascending: false });
      }
      const { data, error } = await q.limit(200);
      if (error) throw error;
      let rows = (data as DigitalResource[]) ?? [];
      if (filters.favoritesOnly && user) {
        const { data: favs } = await supabase
          .from("resource_favorites").select("resource_id").eq("user_id", user.id);
        const set = new Set((favs ?? []).map((f) => f.resource_id));
        rows = rows.filter((r) => set.has(r.id));
      }
      return rows;
    },
  });
}

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["resource-favorites", user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (!user) return new Set();
      const { data } = await supabase
        .from("resource_favorites").select("resource_id").eq("user_id", user.id);
      return new Set((data ?? []).map((d) => d.resource_id));
    },
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (resourceId: string) => {
      if (!user) throw new Error("Sign in to save favorites");
      return toggleFavorite(resourceId, user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resource-favorites"] }),
  });
}

export function useRate() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ resourceId, rating, comment }: { resourceId: string; rating: number; comment?: string }) => {
      if (!user) throw new Error("Sign in to rate");
      await rateResource(resourceId, user.id, rating, comment);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources"] }),
  });
}

export function useDownloadHistory() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["resource-downloads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("resource_downloads")
        .select("id, downloaded_at, resource_id, digital_resources(id,title,file_name,storage_path,file_url,cover_image_url)")
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });
}

export function useResourceAnalytics() {
  return useQuery({
    queryKey: ["resource-analytics"],
    queryFn: async () => {
      const [{ count: total }, { data: top }, { data: recent }, { count: downloadsCount }] = await Promise.all([
        supabase.from("digital_resources").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("digital_resources").select("id,title,download_count,view_count").is("deleted_at", null).order("download_count", { ascending: false }).limit(5),
        supabase.from("digital_resources").select("id,title,created_at").is("deleted_at", null).order("created_at", { ascending: false }).limit(5),
        supabase.from("resource_downloads").select("id", { count: "exact", head: true }),
      ]);
      return { total: total ?? 0, top: top ?? [], recent: recent ?? [], downloadsCount: downloadsCount ?? 0 };
    },
  });
}
