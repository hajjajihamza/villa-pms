import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import type { Auth } from '@/types/auth';

type SharedProps = {
    auth: Auth;
};

export default function Dashboard() {
    const { auth } = usePage<SharedProps>().props;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <section className="rounded-[2rem] border border-white bg-white/80 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/5 dark:bg-gray-900/80">
                <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    Dashboard
                </p>
                <h1 className="mt-3 text-3xl font-black text-black dark:text-white">
                    Bienvenue, {auth.user.username}
                </h1>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    Vous etes connecte avec une session securisee Laravel.
                </p>
            </section>
        </AuthenticatedLayout>
    );
}
