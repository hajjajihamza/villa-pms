import { useForm } from '@inertiajs/react';
import { Save, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import type { SubmitEvent } from 'react';
import { useRef } from 'react';
import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type PasswordFormData = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function PasswordForm() {
    // ────────────────────────────────────────────────
    //  State & Variables
    // ────────────────────────────────────────────────
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    // Initialize Inertia form
    const { data, setData, put, processing, errors, reset } = useForm<PasswordFormData>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleSubmit = (event: SubmitEvent) => {
        event.preventDefault();

        // Send PUT request to update password
        put(SettingController.updatePassword().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <Card className="border-0 shadow-sm bg-background">
            <CardHeader className="px-6 py-4 border-b">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Lock className="size-5 text-primary" />
                    Changer le mot de passe
                </CardTitle>
                <CardDescription>
                    Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester en sécurité.
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="px-6 py-6 space-y-6">
                    {/* Current Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="current_password" className="text-[13px] font-medium text-foreground/90">
                            Mot de passe actuel
                        </Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className={cn(
                                    'h-11 pl-10 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                    errors.current_password && 'border-destructive'
                                )}
                                autoComplete="current-password"
                            />
                        </div>
                        <InputError message={errors.current_password} />
                    </div>

                    {/* New Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[13px] font-medium text-foreground/90">
                            Nouveau mot de passe
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className={cn(
                                    'h-11 pl-10 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                    errors.password && 'border-destructive'
                                )}
                                autoComplete="new-password"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-[13px] font-medium text-foreground/90">
                            Confirmer le nouveau mot de passe
                        </Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className={cn(
                                    'h-11 pl-10 rounded-xl bg-background/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.05)]',
                                    errors.password_confirmation && 'border-destructive'
                                )}
                                autoComplete="new-password"
                            />
                        </div>
                        <InputError message={errors.password_confirmation} />
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
                        {processing ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
