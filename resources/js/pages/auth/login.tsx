import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2, Lock, User, AlertCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import AuthController from '@/actions/App/Http/Controllers/Auth/AuthController';
import Logo from '@/components/logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';

// ────────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────────
type LoginForm = {
    username: string;
    password: string;
    remember: boolean;
};

// ────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────
export default function Login() {
    // ────────────────────────────────────────────────
    //  States & Variables
    // ────────────────────────────────────────────────
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    // ────────────────────────────────────────────────
    //  Handlers
    // ────────────────────────────────────────────────
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        post(AuthController.login().url, {
            onFinish: () => reset('password'),
        });
    };

    // ────────────────────────────────────────────────
    //  Render
    // ────────────────────────────────────────────────
    return (
        <GuestLayout>
            <Head title="Connexion" />

            {/* ── Full-viewport wrapper ── */}
            <div className="flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6">

                {/* ── Card (shadcn) ── */}
                <Card
                    className="
                        animate-[fadeUp_.55s_cubic-bezier(.16,1,.3,1)_both]
                        w-full max-w-[440px]
                        overflow-hidden
                        rounded-[2.5rem]
                        border border-white/70
                        bg-white/75
                        p-0
                        shadow-[0_32px_80px_-12px_rgba(0,0,0,.18),0_0_0_1px_rgba(255,255,255,.6)_inset]
                        backdrop-blur-2xl
                        dark:border-white/[.08]
                        dark:bg-[#1a1a1a]/80
                        dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,.6)]
                    "
                >
                    {/* ── Card Header (shadcn) ── */}
                    <CardHeader className="flex flex-col items-center gap-3 px-8 pt-10 pb-0 text-center sm:px-10 sm:pt-12">
                        <Logo size="xl" showText={true} />
                    
                        {/* shadcn Separator styled as brand divider */}
                        <Separator className="w-16 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    </CardHeader>

                    {/* ── Card Content (shadcn) ── */}
                    <CardContent className="px-8 pt-8 pb-10 sm:px-10 sm:pb-12">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                            {/* ── Username field ── */}
                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="username"
                                    className="ml-1 text-[10px] font-black tracking-[.2em] text-[#8a8070] uppercase dark:text-[#9a9080]"
                                >
                                    Nom d'utilisateur
                                </Label>
                                <div className="group relative">
                                    <User
                                        size={16}
                                        className="
                                            absolute top-1/2 left-5 -translate-y-1/2
                                            text-[#b0a898]
                                            transition-colors duration-200
                                            group-focus-within:text-primary
                                            dark:text-[#6a6a6a]
                                        "
                                    />
                                    <Input
                                        id="username"
                                        type="text"
                                        autoComplete="username"
                                        autoFocus
                                        placeholder="Identifiant"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        aria-invalid={!!errors.username}
                                        className="
                                            h-[54px] w-full
                                            rounded-2xl
                                            border border-[#e2ddd6]
                                            bg-[#faf9f7]
                                            pl-11 pr-5
                                            text-sm font-semibold text-[#2d2d2d]
                                            placeholder:font-normal placeholder:text-[#c0b8b0]
                                            shadow-[0_1px_3px_rgba(0,0,0,.06)]
                                            outline-none ring-0
                                            transition-all duration-200
                                            hover:border-[#c8c0b8]
                                            focus-visible:border-primary
                                            focus-visible:bg-white
                                            focus-visible:ring-3
                                            focus-visible:ring-primary/15
                                            focus-visible:shadow-[0_0_0_4px_var(--color-primary)/8%]
                                            aria-[invalid=true]:border-rose-400
                                            dark:border-white/[.08]
                                            dark:bg-white/5
                                            dark:text-white
                                            dark:placeholder:text-white/20
                                            dark:focus-visible:border-primary/60
                                        "
                                    />
                                </div>
                            </div>

                            {/* ── Password field ── */}
                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="password"
                                    className="ml-1 text-[10px] font-black tracking-[.2em] text-[#8a8070] uppercase dark:text-[#9a9080]"
                                >
                                    Mot de Passe
                                </Label>
                                <div className="group relative">
                                    <Lock
                                        size={16}
                                        className="
                                            absolute top-1/2 left-5 -translate-y-1/2
                                            text-[#b0a898]
                                            transition-colors duration-200
                                            group-focus-within:text-primary
                                            dark:text-[#6a6a6a]
                                        "
                                    />
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        aria-invalid={!!errors.password}
                                        className="
                                            h-[54px] w-full
                                            rounded-2xl
                                            border border-[#e2ddd6]
                                            bg-[#faf9f7]
                                            pl-11 pr-5
                                            text-sm font-semibold text-[#2d2d2d]
                                            placeholder:font-normal placeholder:text-[#c0b8b0]
                                            shadow-[0_1px_3px_rgba(0,0,0,.06)]
                                            outline-none ring-0
                                            transition-all duration-200
                                            hover:border-[#c8c0b8]
                                            focus-visible:border-primary
                                            focus-visible:bg-white
                                            focus-visible:ring-3
                                            focus-visible:ring-primary/15
                                            focus-visible:shadow-[0_0_0_4px_var(--color-primary)/8%]
                                            aria-[invalid=true]:border-rose-400
                                            dark:border-white/[.08]
                                            dark:bg-white/5
                                            dark:text-white
                                            dark:placeholder:text-white/20
                                            dark:focus-visible:border-primary/60
                                        "
                                    />
                                </div>
                            </div>

                            {/* ── Remember me ── */}
                            <div className="flex items-center gap-2.5 pl-1">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked === true)}
                                    className="
                                        h-4 w-4 rounded-[5px]
                                        border-[#d0c8be]
                                        data-[state=checked]:border-primary
                                        data-[state=checked]:bg-primary
                                        data-[state=checked]:text-primary-foreground
                                        dark:border-white/[.15]
                                    "
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-[10px] font-black tracking-[.18em] text-[#8a8070] uppercase dark:text-[#9a9080]"
                                >
                                    Se souvenir de moi
                                </Label>
                            </div>

                            {/* ── Error alert (shadcn) ── */}
                            {(errors.username || errors.password) && (
                                <Alert
                                    variant="destructive"
                                    className="
                                        rounded-2xl
                                        border border-rose-200/60
                                        bg-rose-50/80
                                        backdrop-blur-sm
                                        dark:border-rose-800/30
                                        dark:bg-rose-950/30
                                    "
                                >
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <AlertDescription className="text-[10px] font-black tracking-[.18em] uppercase">
                                        {errors.username ?? errors.password}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* ── Submit button (shadcn) ── */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="
                                    group mt-1
                                    h-[54px] w-full
                                    rounded-2xl
                                    bg-primary
                                    text-[13px] font-black tracking-widest text-primary-foreground uppercase
                                    shadow-[0_4px_20px_var(--color-primary)/35%]
                                    transition-all duration-200
                                    hover:scale-[1.015]
                                    hover:bg-primary/90
                                    hover:shadow-[0_8px_28px_var(--color-primary)/45%]
                                    active:scale-[.985]
                                    disabled:cursor-not-allowed disabled:opacity-60
                                "
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Connexion…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Se connecter</span>
                                        <ArrowRight
                                            size={16}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* ── Footer ── */}
                        <p className="mt-8 text-center text-[9px] font-bold tracking-[.22em] text-[#b0a898] uppercase dark:text-[#5a5a5a]">
                            © {new Date().getFullYear()} Villa Mouloud · Architectural Excellence
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Global keyframe ── */}
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(28px) scale(.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);   }
                }
            `}</style>
        </GuestLayout>
    );
}