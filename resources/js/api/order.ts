import apiService from '@/services/api';
import type { Order, Paginated } from '@/types';

export type OrderResponse = {
    data: Order[];
    meta: Paginated;
};

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const getOrders = async (params: { 
    page?: number; 
    search?: string; 
    date?: string; 
    accommodation_id?: number | string;
}): Promise<OrderResponse> => {
    const response = await apiService.get<OrderResponse>('/orders', params);
    return response;
};

export const deleteOrderItem = async (id: number): Promise<void> => {
    await apiService.delete<void>(`/order-items/${id}`);
};

export const updateOrderItem = async (id: number, quantity: number): Promise<void> => {
    await apiService.patch<void>(`/order-items/${id}`, { quantity });
};