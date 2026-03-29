<?php
namespace App\Services\Auth;

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticationService
{
    public function authenticate(LoginRequest $request): void
    {
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
        if (!$authenticated) {
            $authenticated = Auth::attempt([
                'email' => $identifier,
                'password' => $password,
            ], $remember);
        }

        // Gestion de l'échec d'authentification : incrémentation du compteur de rate limiting
        if (!$authenticated) {
            throw ValidationException::withMessages([
                'username' => trans('auth.failed'),
            ]);
        }

        // Récupération du token
        $request->session()->regenerate();
    }

    public function Invalidate(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
