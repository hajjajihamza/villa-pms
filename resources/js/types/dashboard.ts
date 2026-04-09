export type ChannelStat = {
    name: string;
    color: string;
    count: number;
    percentage: number;
    amount: number;
    commission: number;
    commission_amount: number;
};

export type DashboardStats = {
    revenue: {
        total: number;
        orders_revenue: number;
        reservations_revenue: number;
    };
    expenses: number;
    reservations_by_channel: ChannelStat[];
    reservations_count: number;
    orders_count: number;
};
