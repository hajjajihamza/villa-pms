import { Head } from '@inertiajs/react';
import { Building2, RadioTower, User, ShieldCheck } from 'lucide-react';
import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController';
import AccommodationTable from '@/components/settings/accommodation/accommodation-table';
import PasswordForm from '@/components/settings/account/password-form';
import ProfileForm from '@/components/settings/account/Profile-form';
import ChannelTable from '@/components/settings/channel/channel-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { Accommodation, BreadcrumbItem, Channel } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type SettingsPageProps = {
    accommodations: Accommodation[];
    channels: Channel[];
};

// ────────────────────────────────────────────────
//  Tools
// ────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parametres',
        href: SettingController.index(),
    },
];

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function SettingsIndex({ accommodations, channels }: SettingsPageProps) {
    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs} title="Parametres" description="Gere les hebergements et les canaux de reservation depuis un seul espace.">
            <Head title="Parametres" />

            <Tabs defaultValue="accommodations" className="space-y-6">
                <TabsList className="h-auto w-full p-1 flex flex-nowrap justify-start overflow-x-auto overflow-y-hidden scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] bg-muted/50 border rounded-xl">
                    <TabsTrigger
                        value="accommodations"
                        className="rounded-lg py-2 px-4 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                        <Building2 className="size-4 mr-2" />
                        Hébergements
                    </TabsTrigger>

                    <TabsTrigger
                        value="channels"
                        className="rounded-lg py-2 px-4 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                        <RadioTower className="size-4 mr-2" />
                        Canaux
                    </TabsTrigger>

                    <TabsTrigger
                        value="profile"
                        className="rounded-lg py-2 px-4 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                        <User className="size-4 mr-2" />
                        Profil
                    </TabsTrigger>

                    <TabsTrigger
                        value="security"
                        className="rounded-lg py-2 px-4 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                        <ShieldCheck className="size-4 mr-2" />
                        Sécurité
                    </TabsTrigger>
                </TabsList>

                {/* Accommodations Tab Content */}
                <TabsContent value="accommodations" className="mt-0 outline-none">
                    <AccommodationTable accommodations={accommodations} />
                </TabsContent>

                {/* Channels Tab Content */}
                <TabsContent value="channels" className="mt-0 outline-none">
                    <ChannelTable channels={channels} />
                </TabsContent>

                {/* Profile Tab Content */}
                <TabsContent value="profile" className="mt-0 outline-none">
                    <ProfileForm />
                </TabsContent>

                {/* Security Tab Content */}
                <TabsContent value="security" className="mt-0 outline-none">
                    <PasswordForm />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
