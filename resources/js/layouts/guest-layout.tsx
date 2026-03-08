import type { PropsWithChildren } from 'react';

export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F2F2F7] p-6 dark:bg-black">
            <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-[500px] w-[500px] animate-pulse rounded-full bg-brand-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[120px]" />
            {children}
        </main>
    );
}
