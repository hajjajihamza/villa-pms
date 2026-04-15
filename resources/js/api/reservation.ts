import apiService from '@/services/api';
import type { Accommodation, Channel } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type BookingData = {
    channels: Channel[];
    accommodations: Accommodation[];
};

// ────────────────────────────────────────────────
//  Actions
// ────────────────────────────────────────────────
export const getBookingData = async (): Promise<BookingData> => {
    const response = await apiService.get<BookingData>(`/reservations/booking-data`);
    return response;
};