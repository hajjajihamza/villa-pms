import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'xl';

type LogoProps = {
    size?: LogoSize;
    showText?: boolean;
    className?: string;
};

const sizeMap: Record<LogoSize, string> = {
    sm: 'h-10 w-10 text-xs',
    md: 'h-14 w-14 text-sm',
    xl: 'h-20 w-20 text-base',
};

export default function Logo({ size = 'md', showText = false, className }: LogoProps) {
    const appName = usePage().props.name;

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            {/* Image block */}
            <img
                src="/images/logo.png"
                alt="Villa Mouloud logo"
                className={cn(sizeMap[size], 'object-contain drop-shadow-sm')}
                draggable={false}
            />
            {/* Text block */}
            {showText && (
                <div className="-mt-4 text-center">
                    <h1 className="text-3xl font-black tracking-tighter dark:text-white">
                        {appName}
                    </h1>
                    <p className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">
                        Property Management System
                    </p>
                </div>
            )}
        </div>
    );
}
