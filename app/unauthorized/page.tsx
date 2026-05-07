"use client";

import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LogoutIcon from "@mui/icons-material/Logout";
import BlockIcon from "@mui/icons-material/Block";

export default function UnauthorizedPage() {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/auth/login");
    }

    return (
        <Box sx={{
            minHeight: "100vh",
            bgcolor: "#F5F6FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
        }}>
            <Card sx={{
                maxWidth: 420,
                width: "100%",
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.07)"
            }}>
                {/* Banda superior */}
                <Box sx={{
                    bgcolor: "#1A1A2E",
                    borderRadius: "16px 16px 0 0",
                    px: 3,
                    py: 3,
                    display: "flex",
                    justifyContent: "center"
                }}>
                    <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: "rgba(211,47,47,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <BlockIcon sx={{fontSize: 34, color: "#EF9F9F"}}/>
                    </Box>
                </Box>

                <CardContent sx={{p: 4, textAlign: "center"}}>
                    <Typography variant="h5" fontWeight={800} mb={1} color="text.primary">
                        Lo sentimos, Error al iniciar sesión.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={3}>
                        Lo sentimos tenemos problemas al iniciar sesión, por favor intente nuevamente más tarde.
                        Si piensa que es un error, por favor, contacte a soporte.
                    </Typography>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<LogoutIcon/>}
                            onClick={handleLogout}
                            sx={{
                                py: 1.4, fontWeight: 800, borderRadius: 3,
                                bgcolor: "#FFD600", color: "#1A1A2E",
                                "&:hover": {bgcolor: "#F9A800"},
                            }}>
                            Regresar
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}