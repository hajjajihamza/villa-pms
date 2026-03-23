import countries from 'i18n-iso-countries';
import frLocale from 'i18n-iso-countries/langs/fr.json';
import {
    Phone, Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { CircleFlag } from 'react-circle-flags';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Visitor } from '@/types/models';
import 'react-international-phone/style.css';
import { VisitorDocumentSection } from './VisitorDocumentSection';
import { VisitorForm } from '../ReservationForm/VisitorForm';
import { router } from '@inertiajs/react';
import VisitorController from '@/actions/App/Http/Controllers/VisitorController';

interface VisitorCardProps {
    visitor: Visitor;
    index: number;
}

countries.registerLocale(frLocale);

export function VisitorCard({ visitor, index }: VisitorCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isInitialAdd, setIsInitialAdd] = useState(false);
    const isMain = Boolean(Number(visitor.is_main));

    const handleSuccess = () => {
        setIsEditing(false);
        setIsInitialAdd(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setIsInitialAdd(false);
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce visiteur ?')) {
            router.delete(VisitorController.destroyVisitor(visitor.id).url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <div
            className={cn(
                "group/card relative space-y-6 rounded-2xl border-2 p-6 transition-all sm:p-8",
                isMain
                    ? 'bg-brand-50/20 dark:bg-brand-900/10 border-brand-500/20 dark:border-brand-500/30'
                    : 'border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30'
            )}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex w-full items-center gap-4">
                    <div
                        className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black sm:h-14 sm:w-14 sm:rounded-2xl",
                            isMain
                                ? 'bg-brand-500 text-white shadow-md'
                                : 'bg-gray-200 text-gray-500 dark:bg-gray-800'
                        )}
                    >
                        {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                        {!isEditing ? (
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="truncate text-base font-medium tracking-tight text-foreground">
                                        {visitor.full_name}
                                    </h4>
                                    {isMain && (
                                        <span className="bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800 inline-flex items-center rounded-full border px-2 py-0.5 text-[0.55rem] font-medium tracking-wider whitespace-nowrap uppercase">
                                            Hôte principal
                                        </span>
                                    )}
                                </div>

                                <div className="mt-1.5 flex flex-wrap gap-3">
                                    {visitor.country && (
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <CircleFlag
                                                countryCode={visitor.country.toLowerCase()}
                                                height={14}
                                                width={14}
                                                className="shrink-0 rounded-full"
                                            />
                                            <span className="text-[0.7rem] font-medium">
                                                {countries.getName(
                                                    visitor.country.toUpperCase(),
                                                    'fr',
                                                ) || visitor.country}
                                            </span>
                                        </div>
                                    )}

                                    {visitor.phone && (
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Phone
                                                size={11}
                                                className="shrink-0"
                                            />
                                            <span className="text-[0.7rem] font-medium tracking-wide">
                                                {visitor.phone}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <VisitorForm
                                reservationId={visitor.reservation_id}
                                visitor={visitor}
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                                initialAddDocument={isInitialAdd}
                                showTitle={false}
                                className="p-0 bg-transparent border-0"
                            />
                        )}
                    </div>
                    {!isEditing && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                Modifier
                            </Button>
                            {!isMain && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-100 dark:border-red-900/50"
                                    onClick={handleDelete}
                                >
                                    <Trash2 size={15} />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {!isEditing && (
            <VisitorDocumentSection
                documents={visitor.documents?.map(doc => ({
                    id: doc.id,
                    type: doc.type,
                    url: `/storage/${doc.file_path}`,
                })) || []}
                onAdd={() => {
                    setIsInitialAdd(true);
                    setIsEditing(true);
                }}
                onRemove={() => setIsEditing(true)}
                onUpdate={() => setIsEditing(true)}
                onFileChange={() => setIsEditing(true)}
                errors={{}}
                baseId={`visitor-${visitor.id}`}
                isEditing={false}
            />
            )}
        </div>
    );
}
