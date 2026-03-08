import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import type { Auth } from '@/types/auth';

type SharedProps = {
    auth: Auth;
};

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedProps>().props;

    return (
        <main className="min-h-screen bg-[#F2F2F7] p-6 dark:bg-black">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <header className="flex items-center justify-between rounded-3xl border border-white bg-white/80 p-5 backdrop-blur-2xl dark:border-white/5 dark:bg-gray-900/80">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                            Connecte
                        </p>
                        <p className="text-lg font-black text-black dark:text-white">{auth.user.name}</p>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="rounded-2xl bg-black px-5 py-3 text-[11px] font-black text-white uppercase transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black"
                    >
                        Se deconnecter
                    </Link>
                </header>

                {children}
            </div>
        </main>
    );
}
