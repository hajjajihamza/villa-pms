import type { BaseModel, DateTimeString, Role } from '@/types/models';

export type User = BaseModel & {
    name: string;
    username: string;
    email: string;
    avatar?: string;
    email_verified_at: DateTimeString | null;
    role: Role;
    is_admin: boolean;
};

export type Auth = {
    user: User;
};
