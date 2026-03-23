import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Reservation } from '@/types';

export const useReservationDetails = (reservationId: number) => {
    return useQuery<Reservation>({
        queryKey: ['reservation', reservationId],
        queryFn: async () => {
            const { data } = await axios.get<Reservation>(`/api/reservations/${reservationId}`);
            return data;
        },
        suspense: true,
    });
};
