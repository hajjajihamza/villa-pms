import { Link } from '@inertiajs/react';
import { BookOpen, CalendarDays, FolderGit2, HandCoins, LayoutGrid, Settings } from 'lucide-react';
import DashboardController from '@/actions/App/Http/Controllers/DashboardController';
import ExpenseController from '@/actions/App/Http/Controllers/Expense/ExpenseController';
import PlanningController from '@/actions/App/Http/Controllers/Reservation/PlanningController';
import ReservationController from '@/actions/App/Http/Controllers/Reservation/ReservationController';
import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Depot',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {

    const mainNavItems: NavItem[] = [
        {
            title: 'Tableau de bord',
            href: DashboardController.index(),
            icon: LayoutGrid,
        },
        {
            title: 'Planning',
            href: PlanningController.index(),
            icon: CalendarDays,
        },
        {
            title: 'Reservations',
            href: ReservationController.index(),
            icon: CalendarDays,
        },
        {
            title: 'Depenses',
            href: ExpenseController.index(),
            icon: HandCoins,
        },
        {
            title: 'Parametres',
            href: SettingController.index(),
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={DashboardController.index()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
