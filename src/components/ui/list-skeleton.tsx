import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  count?: number;
  className?: string;
  variant?: "row" | "card";
}

/** Reusable skeleton for list/grid loading states across portals. */
export function ListSkeleton({
  count = 5,
  className,
  variant = "row",
}: ListSkeletonProps) {
  return (
    <div
      className={cn(
        variant === "card"
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          : "space-y-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) =>
        variant === "card" ? (
          <div
            key={i}
            className="rounded-lg border border-border p-4 space-y-3 bg-card"
          >
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ) : (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-md border border-border bg-card"
          >
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}
