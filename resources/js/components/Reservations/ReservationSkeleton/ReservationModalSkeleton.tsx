import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function ReservationModalSkeleton() {
    return (
        <div className="space-y-6 p-2">
            <section className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full rounded-2xl" />
            </section>
            <section className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
            </section>
            <section className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
            </section>
            <section className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-40 w-full rounded-2xl" />
            </section>
        </div>
    );
}

export default ReservationModalSkeleton;
