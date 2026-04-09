import { Skeleton } from '@/components/ui/skeleton';

export default function StepBookingSkeleton() {
    return (
        <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>

            <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <div className="mt-1 flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-lg" />
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    );
}
