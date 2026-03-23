import { useForm } from '@inertiajs/react';
import { addDays, parseISO, startOfToday } from 'date-fns';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import { toFormDate } from '@/lib/format-date';
import type { Reservation } from '@/types';
import type { ReservationFormData } from './ReservationForm';

interface ReservationContextType {
    form: ReturnType<typeof useForm<ReservationFormData>>;
    step: number;
    totalSteps: number;
    isEditing: boolean;
    reservation: Reservation | null | undefined;
    isValid: () => boolean;
    nextStep: () => void;
    prevStep: () => void;
    submit: () => void;
    closeAndReset: () => void;
    setStep: (step: number) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const initialData: ReservationFormData = {
    check_in: toFormDate(startOfToday()),
    check_out: toFormDate(addDays(startOfToday(), 1)),
    adults: 1,
    children: 0,
    total: 0,
    advance_amount: 0,
    channel_id: undefined,
    accommodation_id: undefined,
    full_name: '',
    phone: '',
    country: 'MA',
    documents: [],
};

export const ReservationProvider = ({
    children,
    open,
    onOpenChange,
    reservation,
    defaultDate,
}: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reservation?: Reservation | null;
    defaultDate?: string | null;
}) => {
    const form = useForm<ReservationFormData>(initialData);
    const [step, setStep] = useState<number>(1);
    const totalSteps = 2;
    const isEditing = Boolean(reservation);

    const isValid = () => {
        const requiredFields = ['check_in', 'check_out', 'accommodation_id', 'channel_id'];
        return requiredFields.every((field) => !!form.data[field as keyof ReservationFormData]);
    };

    const nextStep = () => {
        if (step === 1 && !isValid()) return;
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const closeAndReset = () => {
        form.reset();
        form.clearErrors();
        setStep(1);
        onOpenChange(false);
    };

    const submit = () => {
        if (reservation) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            form.post(ReservationController.update(reservation.id).url, {
                preserveScroll: true,
                onSuccess: () => closeAndReset(),
            });
            return;
        }

        form.post(ReservationController.store().url, {
            preserveScroll: true,
            onSuccess: () => closeAndReset(),
        });
    };

    useEffect(() => {
        if (!open) {
            form.setData(initialData);
            return;
        }

        if (reservation) {
            form.setData({
                ...initialData,
                check_in: reservation.check_in,
                check_out: reservation.check_out,
                adults: reservation.adults,
                children: reservation.children,
                advance_amount: reservation.advance_amount ?? 0,
                channel_id: reservation.channel_id,
                accommodation_id: reservation.accommodation_id,
                total: reservation.total_price ?? 0,
                full_name: reservation.main_visitor?.full_name ?? '',
                phone: reservation.main_visitor?.phone ?? '',
                country: reservation.main_visitor?.country ?? 'ma',
                documents: reservation.main_visitor?.documents?.map(doc => ({
                    id: doc.id,
                    type: doc.type,
                    url: `/storage/${doc.file_path}`,
                })) ?? [],
            });
        } else {
            form.setData(initialData);
            if (defaultDate) {
                form.setData('check_in', toFormDate(parseISO(defaultDate)));
                form.setData('check_out', toFormDate(addDays(parseISO(defaultDate), 1)));
            }
        }
    }, [reservation, open]);

    return (
        <ReservationContext.Provider
            value={{
                form,
                step,
                totalSteps,
                isEditing,
                reservation,
                isValid,
                nextStep,
                prevStep,
                submit,
                closeAndReset,
                setStep,
            }}
        >
            {children}
        </ReservationContext.Provider>
    );
};

export const useReservation = () => {
    const context = useContext(ReservationContext);
    if (context === undefined) {
        throw new Error('useReservation must be used within a ReservationProvider');
    }
    return context;
};
