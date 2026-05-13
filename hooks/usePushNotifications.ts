"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Estado = "idle" | "solicitando" | "activo" | "denegado" | "no_soportado" | "error";

function base64UrlToUint8Array(base64Url: string): Uint8Array {
    const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
}


function detectarEstadoInicial(): Estado {
    if (typeof window === "undefined") return "idle";
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "no_soportado";
    if (Notification.permission === "denied") return "denegado";
    return "idle";
}

export function usePushNotifications() {
    const [estado, setEstado] = useState<Estado>(detectarEstadoInicial);

    const suscribir = useCallback(async (registration: ServiceWorkerRegistration) => {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
            console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY no definida");
            setEstado("error");
            return;
        }

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly:      true,
                applicationServerKey: base64UrlToUint8Array(vapidPublicKey) as unknown as BufferSource,
            });

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from("profiles")
                .update({ web_push_token: JSON.stringify(subscription) })
                .eq("id", user.id);

            setEstado("activo");
        } catch (err) {
            console.error("Error al suscribir a push:", err);
            setEstado("error");
        }
    }, []);

    useEffect(() => {
        if (estado === "no_soportado" || estado === "denegado") return;

        navigator.serviceWorker
            .register("/sw.js")
            .then(async (registration) => {
                const existente = await registration.pushManager.getSubscription();
                if (existente) {
                    setEstado("activo");
                    return;
                }
                if (Notification.permission === "granted") {
                    await suscribir(registration);
                }
            })
            .catch(() => setEstado("error"));
    }, [suscribir]);

    async function solicitarPermiso() {
        if (estado === "no_soportado") return;

        setEstado("solicitando");

        const permiso = await Notification.requestPermission();

        if (permiso !== "granted") {
            setEstado("denegado");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await suscribir(registration);
        } catch {
            setEstado("error");
        }
    }

    async function desactivar() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from("profiles")
                        .update({ web_push_token: null })
                        .eq("id", user.id);
                }
            }

            setEstado("idle");
        } catch {
            setEstado("error");
        }
    }

    return { estado, solicitarPermiso, desactivar };
}