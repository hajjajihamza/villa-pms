import { Head } from '@inertiajs/react';
import { Building2, RadioTower } from 'lucide-react';
import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController';
import AccommodationTable from '@/components/settings/AccommodationTable';
import ChannelTable from '@/components/settings/ChannelTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { Accommodation, BreadcrumbItem, Channel } from '@/types';

type SettingsPageProps = {
    accommodations: Accommodation[];
    channels: Channel[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Parametres',
        href: SettingController.index(),
    },
];

export default function SettingsIndex({ accommodations, channels }: SettingsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parametres" />

            <section className="space-y-6">
                <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Parametres</p>
                    <h1 className="text-2xl font-semibold">Configuration</h1>
                    <p className="text-muted-foreground text-sm">
                        Gere les hebergements et les canaux de reservation depuis un seul espace.
                    </p>
                </div>

                <Tabs defaultValue="accommodations" className="w-full">
                    <TabsList className="inline-flex w-fit">
                        <TabsTrigger value="accommodations" className="w-auto">
                            <Building2 className="size-4 mr-2" />
                            Hebergements
                        </TabsTrigger>
                        <TabsTrigger value="channels" className="w-auto">
                            <RadioTower className="size-4 mr-2" />
                            Canaux
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="accommodations">
                        <AccommodationTable accommodations={accommodations} />
                    </TabsContent>

                    <TabsContent value="channels">
                        <ChannelTable channels={channels} />
                    </TabsContent>
                </Tabs>
            </section>
        </AppLayout>
    );
}
