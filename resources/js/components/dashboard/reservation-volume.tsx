import { DashboardStats } from '@/types/dashboard';
import { formatNumber } from '@/lib/format-number';
import { useIsMobile } from '@/hooks/use-mobile';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type Props = {
    stats: DashboardStats;
}

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export function ReservationVolume({ stats }: Props) {
    // ────────────────────────────────────────────────
    //  Hooks
    // ────────────────────────────────────────────────
    const isMobile = useIsMobile();

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    if (stats.reservations_by_channel.length === 0) {
        return (
            <div className="text-center text-sm text-gray-400 py-12">
                Aucune donnée pour ce mois.
            </div>
        );
    }

    // ────────────────────────────────────────────────
    //  Mobile layout
    // ────────────────────────────────────────────────
    if (isMobile) {
        return (
            <div className="flex flex-col gap-3">
                {stats.reservations_by_channel.map((channel, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3">

                        {/* Top: avatar + name + commission badge */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                                style={{ backgroundColor: channel.color }}>
                                {channel.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                    {channel.name}
                                    <span className="text-[11px] font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                        {channel.commission}%
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{channel.count} réservations</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Commission</p>
                                <p className="text-base font-medium">
                                    {formatNumber(channel.commission_amount, { endWith: 'DH' })}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <div className="flex justify-between text-[11px] mb-1.5">
                                <span className="text-gray-400 uppercase tracking-wide">Part du revenu</span>
                                <span className="text-gray-500 font-medium">{channel.percentage}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${channel.percentage}%`, backgroundColor: channel.color }} />
                            </div>
                        </div>

                        {/* Bottom: revenu */}
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-400">Revenu</p>
                            <p className="text-sm font-medium">
                                {formatNumber(channel.amount, { endWith: 'DH' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // ────────────────────────────────────────────────
    //  Desktop layout
    // ────────────────────────────────────────────────
    return (
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            {stats.reservations_by_channel.map((channel, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

                    {/* Avatar */}
                    <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                        style={{ backgroundColor: channel.color }}>
                        {channel.name[0]}
                    </div>

                    {/* Channel name + count */}
                    <div className="w-36 shrink-0">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                            {channel.name}
                            <span className="text-[11px] font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                {channel.commission}%
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{channel.count} réservations</p>
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-gray-400 uppercase tracking-wide">Part du revenu</span>
                            <span className="text-gray-500 font-medium">{channel.percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${channel.percentage}%`, backgroundColor: channel.color }} />
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="w-28 shrink-0 text-right">
                        <p className="text-[11px] text-gray-400 mb-0.5">Revenu</p>
                        <p className="text-sm font-medium">
                            {formatNumber(channel.amount, { endWith: 'DH' })}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-100 dark:bg-gray-800 shrink-0" />

                    {/* Commission */}
                    <div className="w-28 shrink-0 text-right">
                        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Commission</p>
                        <p className="text-base font-medium">
                            {formatNumber(channel.commission_amount, { endWith: 'DH' })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}