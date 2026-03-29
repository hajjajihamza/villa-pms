import { useForm, usePage } from '@inertiajs/react';
import { Save, User, Mail, AtSign } from 'lucide-react';
import type { SubmitEvent } from 'react';
import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type ProfileFormData = {
    name: string;
    username: string;
    email: string;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function ProfileForm() {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    // Initialize Inertia form with user data
    const { data, setData, patch, processing, errors } = useForm<ProfileFormData>({
        name: user.name ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleSubmit = (event: SubmitEvent) => {
        event.preventDefault();

        // Send PATCH request to update profile
        patch(SettingController.updateProfile().url, {
            preserveScroll: true
        });
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Card className="border-0 shadow-sm bg-background">
            <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    Informations du profil
                </CardTitle>
                <CardDescription>
                    Mettez à jour les informations de votre compte et votre adresse e-mail.
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="px-6 py-6 space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[13px] font-medium text-foreground/90">
                            Nom complet
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={cn(
                                    'h-11 pl-10 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                    errors.name && 'border-destructive'
                                )}
                                required
                                autoComplete="name"
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    {/* Username Field */}
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-[13px] font-medium text-foreground/90">
                            Nom d'utilisateur
                        </Label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                id="username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className={cn(
                                    'h-11 pl-10 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                    errors.username && 'border-destructive'
                                )}
                                required
                                autoComplete="username"
                            />
                        </div>
                        <InputError message={errors.username} />
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[13px] font-medium text-foreground/90">
                            Adresse e-mail
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={cn(
                                    'h-11 pl-10 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                    errors.email && 'border-destructive'
                                )}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>
                </CardContent>

                <CardFooter className="px-6 py-4 border-t bg-muted/30">
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                        className="rounded-xl px-8"
                    >
                        <Save className="size-4 mr-2" />
                        {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
