import { router } from '@inertiajs/react';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';
import { queryClient } from '@/lib/query-client';

export const visitorService = {
  store: (reservationId: number, data: any) => {
    router.post(VisitorController.storeVisitor.url(reservationId), data, {
      preserveScroll: true,
      onSuccess: () => {
        queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
      },
    });
  },

  update: (visitorId: number, data: any, reservationId?: number) => {
    router.put(VisitorController.updateVisitor.url(visitorId), data, {
      preserveScroll: true,
      onSuccess: () => {
        if (reservationId) {
          queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
        }
      },
    });
  },

  destroy: (visitorId: number, reservationId?: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce visiteur ?')) {
      router.delete(VisitorController.destroyVisitor.url(visitorId), {
        preserveScroll: true,
        onSuccess: () => {
          if (reservationId) {
            queryClient.resetQueries({ queryKey: ['reservation', reservationId] });
          }
        },
      });
    }
  },
};
