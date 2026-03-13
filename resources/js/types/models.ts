import type { User } from '@/types/auth';

export type Timestamp = string;
export type DateString = string;
export type DateTimeString = string;

export type DocType = 'ID_CARD' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'RESIDENCE_CARD';
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type Role = 'ADMIN' | 'STAFF';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_OUT';

export type BaseModel = {
    id: number;
    created_at: Timestamp;
    updated_at: Timestamp;
    [key: string]: unknown;
};

export type SoftDeletable = {
    deleted_at: Timestamp | null;
};

export type Accommodation = BaseModel & {
    name: string;
    daily_price: number;
    max_adults: number;
    max_children: number;
    service_price: number;
    color: string;
    units?: Unit[]
};

export type Channel = BaseModel & {
    name: string;
    commission: number;
    color: string;
};

export type Document = BaseModel & {
    file_path: string;
    type: DocType;
    visitor_id: number;
    visitor?: Visitor;
};

export type Expense = BaseModel & {
    name: string;
    amount: number;
    date: DateString;
    description: string | null;
    created_by: number;
    creator?: User;
    category_id: number;
    category?: ExpenseCategory;
    unit_id: number | null;
    unit?: Unit;
};

export type ExpenseCategory = BaseModel & {
    name: string;
};

export type Order = BaseModel & {
    date: DateString;
    reservation_id: number | null;
    reservation?: Reservation;
    total_amount?: number;
    order_items?: OrderItem[];
};

export type OrderItem = BaseModel &
    SoftDeletable & {
        product_name: string;
        quantity: number;
        price: number;
        order_id: number;
        order?: Order;
        product_id: number;
        product?: Product;
        created_by: number;
        creator?: User;
        total?: number;
    };

export type Product = BaseModel & {
    name: string;
    price: number;
    icon: string | null;
    category_id: number;
    category?: ProductCategory;
};

export type ProductCategory = BaseModel & {
    name: string;
};

export type RecurringExpense = BaseModel & {
    name: string;
    amount: number;
    frequency: Frequency;
    interval: number;
    start_date: DateString;
    end_date: DateString | null;
    next_run_date: DateString;
};

export type Reservation = BaseModel &
    SoftDeletable & {
        check_in: DateString;
        check_out: DateString;
        real_check_in: DateTimeString | null;
        real_check_out: DateTimeString | null;
        adults: number;
        children: number;
        reported: boolean;
        advance_amount: number;
        daily_price: number;
        service_price: number;
        deleted_note: string | null;
        created_by: number;
        creator?: User;
        channel_id: number;
        channel?: Channel;
        accommodation_id: number;
        accommodation?: Accommodation;
        total_price?: number;
        total_orders_amount?: number;
        duration?: number;
        total_guests?: number;
        amount_to_pay?: number;
        status?: ReservationStatus;
        can_validate?: boolean;
        visitors?: Visitor[];
        main_visitor?: Visitor;
        orders?: Order[];
    };

export type Unit = BaseModel & {
    name: string;
    reserved_periods: { check_in: string; check_out: string }[];
};

export type Visitor = BaseModel & {
    full_name: string;
    document_number: string | null;
    phone: string | null;
    country: string | null;
    is_main: boolean;
    reservation_id: number;
    reservation?: Reservation;
};
