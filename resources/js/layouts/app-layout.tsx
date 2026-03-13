import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';
import { usePage } from '@inertiajs/react';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage().props as any;

    return (
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
                {children}
            </div>
        </AppLayoutTemplate>
    );
};
