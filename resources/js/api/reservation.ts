import apiService from '@/services/api';
import type { Accommodation, Channel, Reservation } from '@/types';

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

export const getReservationDetails = async (reservationId: number): Promise<Reservation> => {
    const response = await apiService.get<Reservation>(`/reservations/${reservationId}`);
    return response;
};