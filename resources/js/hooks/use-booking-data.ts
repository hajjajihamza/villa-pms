import { useQuery } from '@tanstack/react-query';
import type { Accommodation, Channel, Unit } from '@/types';
import apiService from '@/services/api';

export type BookingData = {
    channels: Channel[];
    units: Unit[];
    accommodations: Accommodation[];
};

export const useBookingData = () => {
    return useQuery<BookingData>({
        queryKey: ['booking-data'],
        queryFn: async () => {
            return await apiService.get<BookingData>('/booking-data');
        },
        suspense: true,
    });
};
