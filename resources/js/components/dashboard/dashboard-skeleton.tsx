import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function DashboardSkeleton() {
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
            <div>
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-md" />
                    <Skeleton className="h-6 w-48 rounded-md" />
                </div>
                <Skeleton className="h-4 w-72 mt-1 mb-4 rounded-md" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col gap-4 p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-colors">
                            <div className="flex items-start justify-between">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="space-y-2 flex flex-col items-end">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-800" />
                            <div className="flex items-end justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                                <div className="space-y-2 flex flex-col items-end">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-1 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
