import { usePage } from '@inertiajs/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { queryClient } from '@/lib/query-client';
import type { BreadcrumbItem } from '@/types';

export type Props = PropsWithChildren & {
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
    description?: string;
    action?: ReactNode
};

export default ({ children, breadcrumbs, title, description, action, ...props }: Props) => {
    const { flash } = usePage().props as any;

    return (
        <QueryClientProvider client={queryClient}>
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                <div className="px-4 py-6">
                    {flash?.success && (
                        <Alert className="mb-4 border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <AlertDescription>{flash.success}</AlertDescription>
                        </Alert>
                    )}
                    {flash?.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}

                    {(title || action) && (
                        <div className='mb-2 flex flex-wrap items-start justify-between gap-2'>
                            <div>
                                <h1 className="text-2xl font-semibold">{title}</h1>
                                {description && (
                                    <p className="text-muted-foreground text-sm">
                                        {description}
                                    </p>
                                )}
                            </div>
                            {action && (
                                <div className="flex shrink-0 items-center gap-2">
                                    {action}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {children}
                </div>
            </AppLayoutTemplate>
        </QueryClientProvider>
    );
};
