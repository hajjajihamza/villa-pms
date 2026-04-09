import apiService from '@/services/api';
import type { DashboardStats } from '@/types/dashboard';

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const getDashboardStatistics = async (month: string): Promise<DashboardStats> => {
    const response = await apiService.get<DashboardStats>(`/statistics/dashboard?month=${month}`);
    return response;
};