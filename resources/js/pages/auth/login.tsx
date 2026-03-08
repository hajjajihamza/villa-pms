import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2, Lock, User, AlertCircle } from 'lucide-react';
import type { FormEventHandler } from 'react';
import Logo from '@/components/logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/guest-layout';

type LoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="animate-fade-in-up w-full max-w-md">
                <div className="space-y-8 rounded-[3rem] border border-white bg-white/80 p-10 shadow-2xl backdrop-blur-2xl dark:border-white/5 dark:bg-gray-900/80">
                    <div className="space-y-3 text-center">
                        <Logo size="xl" showText={true} />
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="ml-5 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                Nom d'utilisateur
                            </Label>
                            <div className="group relative">
                                <User className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-brand-500" />
                                <Input
                                    type="text"
                                    autoComplete="username"
                                    value={data.username}
                                    onChange={(event) => setData('username', event.target.value)}
                                    className="h-16 w-full rounded-3xl border-2 border-gray-100 bg-gray-50/50 px-6 pl-16 font-bold shadow-sm outline-none transition-all duration-300 hover:border-gray-200 focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:border-white/10 dark:focus-visible:ring-brand-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="ml-5 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                Mot de Passe
                            </Label>
                            <div className="group relative">
                                <Lock className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-brand-500" />
                                <Input
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    className="h-16 w-full rounded-3xl border-2 border-gray-100 bg-gray-50/50 px-6 pl-16 font-bold shadow-sm outline-none transition-all duration-300 hover:border-gray-200 focus-visible:border-brand-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand-500/10 dark:border-white/5 dark:bg-white/5 dark:text-white dark:hover:border-white/10 dark:focus-visible:ring-brand-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <label className="flex cursor-pointer items-center gap-3 text-[9px] font-black tracking-widest text-gray-400 uppercase transition-colors hover:text-gray-500">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked === true)}
                                    className="rounded-[6px] border-gray-200 dark:border-white/10"
                                />
                                Se souvenir de moi
                            </label>
                        </div>

                        {(errors.username || errors.password) && (
                            <Alert variant="destructive" className="rounded-2xl border-rose-100/50 dark:border-rose-900/30">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-[10px] font-black tracking-widest uppercase">
                                    {errors.username ?? errors.password}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            disabled={processing}
                            className="group w-full rounded-3xl bg-black py-6 font-black text-white shadow-glow transition-transform hover:scale-[1.02] hover:bg-black active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
