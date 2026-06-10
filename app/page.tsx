"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { createClient } from "@/lib/supabase/client";

const ROLES_DASHBOARD = ["owner", "supervisor", "administrador"];

export default function Index() {
    const router = useRouter();
    const supabase = createClient();
    useEffect(() => {

        async function routeUser() {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.replace("/home");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (profile && ROLES_DASHBOARD.includes(profile.role)) {
                router.replace("/dashboard");
            } else {
                router.replace("/home/user");
            }
        }

        routeUser();
    }, [router]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                bgcolor: "background.default",
            }}
        >
            <CircularProgress size={48} thickness={3} color="primary" />
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    letterSpacing: 2
                }}>
                Preparando tu entorno...
            </Typography>
        </Box>
    );
}