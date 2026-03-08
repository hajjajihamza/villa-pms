<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthenticationService
{
    /**
     * Authentifie un utilisateur en utilisant son nom d'utilisateur ou email et mot de passe.
     *
     * Cette méthode tente d'authentifier l'utilisateur en vérifiant d'abord avec le nom d'utilisateur,
     * puis avec l'email si la première tentative échoue. Elle gère également la limitation de débit
     * pour prévenir les attaques par force brute.
     *
     * @param  LoginRequest  $request  La requête de connexion contenant les identifiants
     *                                 Attend: username (ou email), password, remember
     * @return void Ne retourne rien mais lève une ValidationException en cas d'échec
     *
     * @throws ValidationException Lorsque l'authentification échoue après plusieurs tentatives
     *                             ou lorsque la limite de taux est atteinte
     */
    public function authenticate(LoginRequest $request): void
    {
        // Vérifie que la requête n'a pas dépassé la limite de tentatives autorisées
        $this->ensureIsNotRateLimited($request);

        // Extraction et nettoyage des identifiants depuis la requête
        $identifier = $request->string('username')->trim()->toString();
        $password = $request->string('password')->toString();
        $remember = $request->boolean('remember');

        // Première tentative d'authentification avec le nom d'utilisateur
        $authenticated = Auth::attempt([
            'username' => $identifier,
            'password' => $password,
        ], $remember);

        // Deuxième tentative avec l'email si la première a échoué
        if (! $authenticated) {
            $authenticated = Auth::attempt([
                'email' => $identifier,
                'password' => $password,
            ], $remember);
        }

        // Gestion de l'échec d'authentification : incrémentation du compteur de rate limiting
        if (! $authenticated) {
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'username' => trans('auth.failed'),
            ]);
        }

        // Réinitialisation du compteur de rate limiting en cas de succès
        RateLimiter::clear($this->throttleKey($request));

        // Récupération du token
        $request->session()->regenerate();
    }

    /**
     * Déconnecte l'utilisateur authentifié.
     *
     * Cette méthode invalide la session actuelle de l'utilisateur, régénère le token CSRF
     * pour des raisons de sécurité, et s'assure que toutes les données de session liées
     * à l'authentification sont supprimées.
     *
     * @param  Request  $request  La requête HTTP courante (utilisée pour accéder à la session)
     */
    public function Invalidate(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    /**
     * @throws ValidationException
     */
    private function ensureIsNotRateLimited(LoginRequest $request): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        event(new Lockout($request));

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => (int) ceil($seconds / 60),
            ]),
        ]);
    }

    private function throttleKey(LoginRequest $request): string
    {
        return Str::transliterate(Str::lower($request->string('username')->toString()).'|'.$request->ip());
    }
}
