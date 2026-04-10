"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        async function checkSession() {
            const {
                data: {session},
            } = await supabase.auth.getSession();

            if (session) {
                router.replace("/dashboard");
            } else {
                router.replace("/login");
            }
        }

        checkSession();
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
            <CircularProgress size={48} thickness={3} color="primary"/>
            <Typography variant="body2" color="text.secondary" letterSpacing={2}>
                Verificando sesión...
            </Typography>
        </Box>
    );
}