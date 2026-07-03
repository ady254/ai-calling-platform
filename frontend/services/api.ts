import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token to every request automatically
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                // Fix #30: Prevent aggressive hard redirects that wipe out user state mid-form.
                // In a real Next.js app, this should ideally dispatch an event or use a
                // global state manager to trigger a router.push("/login"), but at minimum
                // we shouldn't force a hard reload without warning.
                toast.error("Your session has expired. Redirecting to login...");
                setTimeout(() => {
                    if (window.location.pathname !== "/login") {
                         window.location.href = "/login";
                    }
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);