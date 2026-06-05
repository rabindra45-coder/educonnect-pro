import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, Sparkles, TrendingUp, Clock, Heart, LayoutGrid } from "lucide-react";
import { useCategories, useFavorites, useResources, type ResourceFilters } from "@/hooks/useResources";
import ResourceCard from "./ResourceCard";
import ResourcePreviewDialog from "./ResourcePreviewDialog";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { DigitalResource } from "@/lib/resourceCenter";

interface Props {
  /** show favorites tab */
  showFavorites?: boolean;
  /** restrict to resources uploaded by this user (teacher portal) */
  uploadedBy?: string;
  title?: string;
  subtitle?: string;
}

type Tab = "all" | "featured" | "trending" | "recent" | "favorites";

const ResourceCenter = ({ showFavorites = true, uploadedBy, title = "Digital Resource Center", subtitle = "Notes, books, past papers, and more — all in one place." }: Props) => {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState<ResourceFilters["sort"]>("newest");
  const [preview, setPreview] = useState<DigitalResource | null>(null);

  const filters: ResourceFilters = useMemo(() => ({
    search: search.trim() || undefined,
    categoryId,
    sort: tab === "trending" ? "popular" : tab === "recent" ? "newest" : sort,
    featured: tab === "featured" || undefined,
    favoritesOnly: tab === "favorites" || undefined,
    uploadedBy,
  }), [search, categoryId, sort, tab, uploadedBy]);

  const { data: categories = [] } = useCategories();
  const { data: resources, isLoading } = useResources(filters);
  const { data: favSet } = useFavorites();

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources, subjects, topics…"
            className="pl-9 h-10"
          />
        </div>
        <Select value={sort} onValueChange={(v: any) => setSort(v)}>
          <SelectTrigger className="w-full sm:w-44 h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="popular">Most downloaded</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" />All</TabsTrigger>
          <TabsTrigger value="featured" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" />Featured</TabsTrigger>
          <TabsTrigger value="trending" className="gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Trending</TabsTrigger>
          <TabsTrigger value="recent" className="gap-1.5"><Clock className="h-3.5 w-3.5" />Recent</TabsTrigger>
          {showFavorites && <TabsTrigger value="favorites" className="gap-1.5"><Heart className="h-3.5 w-3.5" />Favorites</TabsTrigger>}
        </TabsList>
      </Tabs>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Badge
            variant={categoryId === null ? "default" : "outline"}
            onClick={() => setCategoryId(null)}
            className="cursor-pointer h-8 px-3"
          >
            All categories
          </Badge>
          {categories.map((c) => (
            <Badge
              key={c.id}
              variant={categoryId === c.id ? "default" : "outline"}
              onClick={() => setCategoryId(c.id)}
              className="cursor-pointer h-8 px-3 whitespace-nowrap"
              style={categoryId === c.id && c.color ? { backgroundColor: c.color, borderColor: c.color, color: "white" } : undefined}
            >
              {c.name}
            </Badge>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {isLoading ? (
        <ListSkeleton variant="card" count={8} />
      ) : !resources?.length ? (
        <EmptyState
          icon={Search}
          title="No resources found"
          description="Try a different search, category, or filter."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {resources.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              isFavorite={favSet?.has(r.id)}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      <ResourcePreviewDialog resource={preview} onClose={() => setPreview(null)} />
    </div>
  );
};

export default ResourceCenter;
