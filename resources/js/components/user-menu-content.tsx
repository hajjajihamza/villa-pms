import { Link } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { User } from '@/types';
import AuthController from '@/actions/App/Http/Controllers/Auth/AuthController';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild variant="destructive">
                    <Link
                        className="block w-full cursor-pointer"
                        href={AuthController.logout().url}
                        method="post"
                        as="button"
                        onClick={cleanup}
                    >
                        <LogOut className='mr-2'/>
                        Se deconnecter
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </>
    );
}
