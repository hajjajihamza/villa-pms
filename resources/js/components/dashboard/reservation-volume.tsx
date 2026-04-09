import { DashboardStats } from '@/types/dashboard';
import { formatNumber } from '@/lib/format-number';

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
    //  Render
    // ────────────────────────────────────────────────
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.reservations_by_channel.length > 0 ? (
                stats.reservations_by_channel.map((channel, i) => {
                    return (
                        <div key={i} className="flex flex-col gap-4 p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            {/* Top row */}
                            <div className="flex items-start justify-between">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium text-base"
                                    style={{ backgroundColor: channel.color }}>
                                    {channel.name[0]}
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Commission</p>
                                    <p className="text-xl font-medium">{formatNumber(channel.commission_amount, { endWith: 'DH' })}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 dark:bg-gray-800" />

                            {/* Meta row */}
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-1.5 text-sm font-medium">
                                        {channel.name}
                                        <span className="text-[11px] font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                            {channel.commission}%
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{channel.count} réservations</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] text-gray-400 mb-0.5">Revenu</p>
                                    <p className="text-sm font-medium" style={{ color: channel.color }}>
                                        {formatNumber(channel.amount, { endWith: 'DH' })}
                                    </p>
                                </div>
                            </div>

                            {/* Bar */}
                            <div>
                                <div className="flex justify-between text-[11px] mb-1.5">
                                    <span className="text-gray-400 uppercase tracking-wide">Part du revenu</span>
                                    <span className="text-gray-500 font-medium">{channel.percentage}%</span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${channel.percentage}%`, backgroundColor: channel.color }} />
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="col-span-2 text-center text-sm text-gray-400 py-12">
                    Aucune donnée pour ce mois.
                </div>
            )}
        </div>
    );
}
