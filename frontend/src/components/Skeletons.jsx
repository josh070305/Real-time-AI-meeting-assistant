export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
  );
}

export function MeetingCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/5 p-6">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
