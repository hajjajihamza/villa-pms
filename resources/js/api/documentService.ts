import { router } from '@inertiajs/react';
import VisitorController from '@/actions/App/Http/Controllers/Reservation/VisitorController';

export const documentService = {
  store: (visitorId: number, data: FormData) => {
    router.post(VisitorController.storeDocument.url(visitorId), data, {
      preserveScroll: true,
    });
  },

  update: (documentId: number, data: FormData) => {
    data.append('_method', 'PUT');
    router.post(VisitorController.updateDocument.url(documentId), data, {
      preserveScroll: true,
    });
  },

  destroy: (documentId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      router.delete(VisitorController.destroyDocument.url(documentId), {
        preserveScroll: true,
      });
    }
  },
};
