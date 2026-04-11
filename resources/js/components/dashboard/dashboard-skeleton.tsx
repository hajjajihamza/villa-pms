import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function DashboardSkeleton() {
    // ────────────────────────────────────────────────
    //  Hooks
    // ────────────────────────────────────────────────
    const isMobile = useIsMobile();

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Row 1: General Stats */}
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i} className="border-none shadow-xl h-52">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-4" />
                            <Skeleton className="h-4 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Row 2: Consolidated Channel Analysis */}
            {isMobile ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3">

                            {/* Top: avatar + name + commission */}
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <Skeleton className="h-3.5 w-24 rounded" />
                                    <Skeleton className="h-3 w-16 rounded" />
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <Skeleton className="h-2.5 w-16 rounded" />
                                    <Skeleton className="h-4 w-20 rounded" />
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between">
                                    <Skeleton className="h-2.5 w-20 rounded" />
                                    <Skeleton className="h-2.5 w-6 rounded" />
                                </div>
                                <Skeleton className="h-1.5 w-full rounded-full" />
                            </div>

                            {/* Bottom: revenu */}
                            <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                                <Skeleton className="h-3 w-12 rounded" />
                                <Skeleton className="h-3.5 w-20 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4">

                            {/* Avatar */}
                            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />

                            {/* Channel name + count */}
                            <div className="w-36 shrink-0 flex flex-col gap-1.5">
                                <Skeleton className="h-3.5 w-24 rounded" />
                                <Skeleton className="h-3 w-16 rounded" />
                            </div>

                            {/* Progress bar */}
                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                <div className="flex justify-between">
                                    <Skeleton className="h-2.5 w-20 rounded" />
                                    <Skeleton className="h-2.5 w-6 rounded" />
                                </div>
                                <Skeleton className="h-1.5 w-full rounded-full" />
                            </div>

                            {/* Revenue */}
                            <div className="w-28 shrink-0 flex flex-col items-end gap-1.5">
                                <Skeleton className="h-2.5 w-12 rounded" />
                                <Skeleton className="h-3.5 w-20 rounded" />
                            </div>

                            {/* Divider */}
                            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800 shrink-0" />

                            {/* Commission */}
                            <div className="w-28 shrink-0 flex flex-col items-end gap-1.5">
                                <Skeleton className="h-2.5 w-16 rounded" />
                                <Skeleton className="h-4 w-20 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
