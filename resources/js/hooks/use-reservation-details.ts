import { useQuery } from '@tanstack/react-query';
import type { Reservation } from '@/types';
import apiService from '@/services/api';

export const useReservationDetails = (reservationId: number) => {
    return useQuery<Reservation>({
        queryKey: ['reservation', reservationId],
        queryFn: async () => await apiService.get<Reservation>(`/reservations/${reservationId}`),
        suspense: true,
    });
};
