export type * from './auth';
export type * from './models';
export type * from './navigation';
export type * from './ui';
export type * from './models';

export type Paginated = {
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};
