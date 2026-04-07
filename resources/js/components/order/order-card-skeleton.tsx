import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function OrderCardSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-gray-100 shadow-sm dark:border-white/5 py-3">
                    <div className="px-2">
                        <div className="flex items-center justify-between gap-2">
                            {/* Left: date + meta */}
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <Skeleton className="h-4 w-32" />

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                    <div className="flex items-center gap-1">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                            </div>

                            {/* Right: total + chevron */}
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="flex flex-col items-center gap-1">
                                    <Skeleton className="h-3 w-8" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
