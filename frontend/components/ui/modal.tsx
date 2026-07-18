"use client";

import { useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** "primary" = indigo (default), "danger" = red for destructive actions */
    tone?: "primary" | "danger";
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * A themed replacement for the native window.confirm() dialog.
 * Renders a centered card over a dimmed backdrop and matches the
 * app's indigo/slate aesthetic. Closes on Escape or backdrop click.
 */
export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "primary",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !loading) onCancel();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, loading, onCancel]);

    // Lock body scroll while open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    const confirmClasses =
        tone === "danger"
            ? "bg-red-600 hover:bg-red-700 shadow-red-200"
            : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200";

    const iconWrap =
        tone === "danger"
            ? "bg-red-50 text-red-600"
            : "bg-indigo-50 text-indigo-600";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-overlay-fade"
                onClick={() => !loading && onCancel()}
            />

            {/* Card */}
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 animate-dialog-pop">
                <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-0.5">
                        <h2
                            id="confirm-dialog-title"
                            className="text-lg font-bold text-slate-900"
                        >
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`inline-flex items-center rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-60 ${confirmClasses}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Working...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
