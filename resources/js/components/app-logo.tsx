import { usePage } from '@inertiajs/react';
import Logo from '@/components/logo';

export default function AppLogo() {
    const appName = usePage().props.name;

    return (
        <>
            <div className="flex aspect-square  items-center justify-center rounded-md">
                <Logo size={'md'}/>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {appName}
                </span>
            </div>
        </>
    );
}
