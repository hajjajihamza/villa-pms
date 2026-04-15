import apiService from '@/services/api';
import type { IcalSource } from '@/types/models';

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const getIcalSources = async (accommodationId: number): Promise<IcalSource[]> => {
    const response = await apiService.get<IcalSource[]>(`/accommodations/${accommodationId}/ical-sources`);
    return response;
};