"use client";

import { useRouter } from "next/navigation";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

export default function NavBar({ isLoggedIn }: { isLoggedIn: boolean }) {
    const router = useRouter();

    return (
        <AppBar position="static" sx={{ bgcolor: "#1A1A2E", color: "white" }}>
            <Toolbar sx={{ justifyContent: "space-between" }}>

                <Box sx={{ display: "flex", alignItems: "center", cursor: 'pointer' }} onClick={() => router.push("/")}>
                    <Typography sx={{
                        fontWeight: 700
                    }}>
                        Yo Reparo
                    </Typography>
                </Box>

                {/* DERECHA: Renderizado condicional basado en la prop */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {isLoggedIn ? (
                        // Si recibe true, no muestra el botón (y puedes agregar el nombre aquí si luego lo pasas como prop)
                        (<Typography variant="body1" sx={{
                            fontWeight: 500
                        }}>Mi Cuenta
                                                    </Typography>)
                    ) : (
                        // Si recibe false, muestra el botón de iniciar sesión
                        (<Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<LoginIcon />}
                            onClick={() => router.push("/auth/login")}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: 2
                            }}
                        >Iniciar sesión
                                                    </Button>)
                    )}
                </Box>

            </Toolbar>
        </AppBar>
    );
}