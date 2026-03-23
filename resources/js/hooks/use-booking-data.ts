import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReservationApiController from '@/actions/App/Http/Controllers/Api/Reservation/ReservationApiController';
import type { Accommodation, Channel, Unit } from '@/types';

type BookingData = {
    channels: Channel[];
    units: Unit[];
    accommodations: Accommodation[];
};

export const useBookingData = () => {
    return useQuery<BookingData>({
        queryKey: ['booking-data'],
        queryFn: async () => {
            const { data } = await axios.get<BookingData>(ReservationApiController.bookingData().url);
            return data;
        },
        suspense: true,
    });
};
