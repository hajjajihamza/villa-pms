import apiService from '@/services/api';
import type { ExpenseCategory } from '@/types';

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const createExpenseCategory = async (payload: { name: string }): Promise<ExpenseCategory> => {
    const response = await apiService.post<ExpenseCategory>('/expense-categories', payload);
    return response;
};