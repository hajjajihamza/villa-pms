import { router } from '@inertiajs/react';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';

export const visitorService = {
  store: (reservationId: number, data: any) => {
    router.post(VisitorController.storeVisitor.url(reservationId), data, {
      preserveScroll: true,
    });
  },

  update: (visitorId: number, data: any) => {
    router.put(VisitorController.updateVisitor.url(visitorId), data, {
      preserveScroll: true,
    });
  },

  destroy: (visitorId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce visiteur ?')) {
      router.delete(VisitorController.destroyVisitor.url(visitorId), {
        preserveScroll: true,
      });
    }
  },
};
