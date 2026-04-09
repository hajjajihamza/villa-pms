import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ShoppingCart, TrendingUp } from 'lucide-react';
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
export function StatCards({ stats }: Props) {
    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Card */}
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium opacity-90">Chiffre d'Affaire</CardTitle>
                    <ShoppingCart className="w-5 h-5 opacity-80" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{formatNumber(stats.revenue.total, {endWith: 'DH'})}</div>
                    <div className="mt-4 flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="bg-white/20 text-white border-none">
                            {formatNumber(stats.revenue.reservations_revenue, {endWith: 'DH'})}
                        </Badge>
                        <span className="opacity-70">Réservations <b title="Nombre de réservations" className='text-white'>( {stats.reservations_count} )</b></span>
                        <Badge variant="secondary" className="bg-white/20 text-white border-none">
                            {formatNumber(stats.revenue.orders_revenue, {endWith: 'DH'})}
                        </Badge>
                        <span className="opacity-70">Commandes <b title="Nombre de commandes" className='text-white'>( {stats.orders_count} )</b></span>
                    </div>
                </CardContent>
                <div className="absolute top-[-10%] right-[-10%] opacity-10">
                    <TrendingUp size={120} />
                </div>
            </Card>

            {/* Expenses Card */}
            <Card className="border-none bg-white dark:bg-gray-900 shadow-xl overflow-hidden relative">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-gray-500">
                    <CardTitle className="text-sm font-medium">Dépenses Totales</CardTitle>
                    <Wallet className="w-5 h-5" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black text-rose-600">-{formatNumber(stats.expenses, {endWith: 'DH'})}</div>
                    <p className="mt-1 text-xs text-gray-500">Flux de trésorerie sortant du mois</p>
                </CardContent>
            </Card>
        </div>
    );
}
