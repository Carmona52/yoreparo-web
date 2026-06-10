"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ModalRecoveryPassword from "@/components/auth/RecoveryPassword";

const logoCasaUrl = "/logo.png";
const logoTextoUrl = "/Yoreparo1024.png";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [openModal, setOpenModal] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.replace("/");
        }
    }

    return (
        <>
            <Grid container sx={{minHeight: "100vh"}}>
                <Grid
                    size={{xs: 12, md: 5}}
                    sx={{
                        display: {xs: "none", md: "flex"},
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "text.primary",
                        p: 6,
                        position: "relative",
                    }}>
                    <Box
                        sx={{
                            textAlign: "center",
                            zIndex: 1,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: {xs: 4, md: 5}
                        }}>
                        <Box
                            component="img"
                            src='/register.svg'
                            alt="Equipo de Yo Reparo saludando"
                            sx={{
                                width: "100%",
                                height: "auto",
                                filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.06))"
                            }}/>

                        <Box sx={{px: 2}}>
                            <Typography variant="h4" sx={{fontWeight: 800, color: "text.primary", mb: 1.5}}>
                                ¡Nos alegra verte!
                            </Typography>

                            <Typography variant="body1" sx={{color: "text.primary", fontWeight: 400, lineHeight: 1.6}}>
                                Bienvenido a <strong>Yo Reparo.</strong> Tu plataforma integral para gestionar
                                reparaciones
                                de forma rápida y eficiente.
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid
                    size={{xs: 12, md: 7}}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        p: 3,
                    }}>
                    <Card
                        sx={{
                            width: "100%",
                            height: "100%",
                            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                            border: "1px solid rgba(0,0,0,0.05)",
                        }}>
                        <CardContent sx={{p: {xs: 4, sm: 6,}}}>
                            <Box sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 4,

                                gap: {xs: 2, sm: 3, md: 5}
                            }}>
                                <Box
                                    component="img"
                                    src={logoCasaUrl}
                                    alt="Logo Yo Reparo"
                                    sx={{
                                        width: "100%",
                                        maxWidth: {xs: 100, sm: 160, md: 220},
                                        height: "auto",
                                    }}
                                />
                                <Box sx={{display: "flex", justifyContent: "center"}}>
                                    <Box
                                        component="img"
                                        src={logoTextoUrl}
                                        alt="Yo Reparo"
                                        sx={{
                                            width: "100%",
                                            maxWidth: {xs: 150, sm: 280, md: 380},
                                            height: "auto",
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Typography variant="h4" gutterBottom sx={{fontWeight: 800, textAlign: "center"}}>
                                Iniciar sesión
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "text.secondary",
                                    mb: 4,
                                    textAlign: "center"
                                }}>
                                Ingresa tus credenciales para acceder al panel.
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleLogin}
                                 sx={{maxWidth: {xs: '100%', md: '80%'}, margin: "auto"}}>
                                <TextField
                                    label="E-mail de correo"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    fullWidth
                                    autoComplete="email"
                                    sx={{mb: 2}}
                                />

                                <TextField
                                    label="Contraseña"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    fullWidth
                                    autoComplete="new-password"
                                    sx={{mb: 2}}
                                />

                                <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth
                                        disableElevation sx={{my: 2}}>
                                    {loading ? <CircularProgress size={24} color="inherit"/> : "Iniciar sesión"}
                                </Button>
                            </Box>
                            <Typography variant='body2' sx={{textAlign: "center", color: "text.secondary",}}>
                                ¿No tienes cuenta?
                                <Button onClick={() => router.push('/auth/register')}>Registrate aquí</Button>
                            </Typography>

                            <Typography variant="body2" align="center" sx={{color: "text.secondary"}}>
                                ¿Has olvidado tu contraseña?
                                <Button variant="text" size="small" disableRipple
                                        onClick={() => setOpenModal(true)}>
                                    Da click aquí para poder restrablecerla
                                </Button>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <ModalRecoveryPassword open={openModal} onClose={() => setOpenModal(false)}/>
        </>
    );
}