import apiService from '@/services/api';
import type { IcalSource } from '@/types/models';

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const getIcalSources = async (channelId: number): Promise<IcalSource[]> => {
    const response = await apiService.get<IcalSource[]>(`/${channelId}/ical-sources`);
    return response;
};