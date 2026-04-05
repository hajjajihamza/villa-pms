import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';


// ────────────────────────────────────────────────────────────
// Configuration par défaut
// ────────────────────────────────────────────────────────────
const defaultConfig: AxiosRequestConfig = {
    baseURL: import.meta.env.VITE_API_URL,
    // withCredentials: true, // send cookies (Laravel Sanctum / session auth)
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // pour que Laravel reconnaisse la requête comme AJAX
    },
};

// ────────────────────────────────────────────────────────────
//  API Client
// ────────────────────────────────────────────────────────────
const apiClient = axios.create(defaultConfig);

// ────────────────────────────────────────────────────────────
//  Helper – merges default config with any per-call overrides
// ────────────────────────────────────────────────────────────
function mergeConfig(options?: AxiosRequestConfig): AxiosRequestConfig {
    return {
        ...defaultConfig,
        ...options,
        headers: {
            ...defaultConfig.headers,
            ...options?.headers,
        },
    };
}

// ────────────────────────────────────────────────────────────
//  API Service
// ────────────────────────────────────────────────────────────
const apiService = {
    /**
     * GET /api/{url}
     *
     * @param url     - Relative path, e.g. '/expenses'
     * @param params  - Optional query-string params
     * @param options - Optional Axios request config overrides
     */
    get: async <T = unknown>(
        url: string,
        params?: Record<string, unknown>,
        options?: AxiosRequestConfig,
    ): Promise<T> => {
        const response = await apiClient.get<T>(url, mergeConfig({ params, ...options }));
        return response.data;
    },

    /**
     * POST /api/{url}
     *
     * @param url     - Relative path, e.g. '/expenses'
     * @param data    - Request body
     * @param options - Optional Axios request config overrides
     */
    post: async <T = unknown>(
        url: string,
        data?: unknown,
        options?: AxiosRequestConfig,
    ): Promise<T> => {
        const response = await apiClient.post<T>(url, data, mergeConfig(options));
        return response.data;
    },

    /**
     * PUT /api/{url}
     * Full resource replacement.
     *
     * @param url     - Relative path, e.g. '/expenses/1'
     * @param data    - Request body
     * @param options - Optional Axios request config overrides
     */
    put: async <T = unknown>(
        url: string,
        data?: unknown,
        options?: AxiosRequestConfig,
    ): Promise<T> => {
        const response = await apiClient.put<T>(url, data, mergeConfig(options));
        return response.data;
    },

    /**
     * PATCH /api/{url}
     * Partial resource update.
     *
     * @param url     - Relative path, e.g. '/expenses/1'
     * @param data    - Partial request body
     * @param options - Optional Axios request config overrides
     */
    patch: async <T = unknown>(
        url: string,
        data?: unknown,
        options?: AxiosRequestConfig,
    ): Promise<T> => {
        const response = await apiClient.patch<T>(url, data, mergeConfig(options));
        return response.data;
    },

    /**
     * DELETE /api/{url}
     *
     * @param url     - Relative path, e.g. '/expenses/1'
     * @param options - Optional Axios request config overrides
     */
    delete: async <T = unknown>(
        url: string,
        options?: AxiosRequestConfig,
    ): Promise<T> => {
        const response = await apiClient.delete<T>(url, mergeConfig(options));
        return response.data;
    },
};

export default apiService;
