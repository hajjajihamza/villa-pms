import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuestDocumentsProps {
    guestId: number;
    guestName: string;
}

export const GuestDocuments: React.FC<GuestDocumentsProps> = ({ guestId, guestName }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} /> Documents
                </h5>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-black text-brand-500">
                    <Plus size={12} className="mr-1" /> Ajouter
                </Button>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Aucun document pour {guestName}</p>
            </div>
        </div>
    );
};
