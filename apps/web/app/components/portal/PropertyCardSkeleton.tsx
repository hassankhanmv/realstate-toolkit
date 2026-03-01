import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
      {/* Image skeleton */}
      <Skeleton className="aspect-[4/3] w-full portal-skeleton rounded-none" />

      <div className="p-4 space-y-3">
        {/* Price row */}
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-28 portal-skeleton" />
          <Skeleton className="h-8 w-8 rounded-full portal-skeleton" />
        </div>

        {/* Title */}
        <Skeleton className="h-4 w-3/4 portal-skeleton" />

        {/* Location */}
        <Skeleton className="h-3 w-1/2 portal-skeleton" />

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <Skeleton className="h-3 w-16 portal-skeleton" />
          <Skeleton className="h-3 w-16 portal-skeleton" />
          <Skeleton className="h-3 w-20 portal-skeleton" />
        </div>
      </div>
    </div>
  );
}
