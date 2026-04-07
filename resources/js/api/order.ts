import apiService from '@/services/api';
import type { Order, Paginated } from '@/types';

export type OrderResponse = {
    data: Order[];
    meta: Paginated;
};

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const getOrders = async (params: { page?: number, search?: string }): Promise<OrderResponse> => {
    const response = await apiService.get<OrderResponse>('/orders', params);
    return response;
};
