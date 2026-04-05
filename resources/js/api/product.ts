import apiService from '@/services/api';
import type { ProductCategory } from '@/types';

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const createProductCategory = async (payload: { name: string }): Promise<ProductCategory> => {
    const response = await apiService.post<ProductCategory>('/product-categories', payload);
    return response;
};