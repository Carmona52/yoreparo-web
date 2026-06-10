"use client";

import * as React from 'react';
import {useState} from "react";
import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import {createUser} from "@/lib/supabase/register";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const logoCasaUrl = "/logo.png";
const logoTextoUrl = "/Yoreparo1024.png";

export default function RegisterPage() {
    const router = useRouter();

    const [open, setOpen] = React.useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createUser(email, password, name, phone, "cliente");
            setOpen(true)
        } catch (err) {
            setError("Ocurrió un error inesperado al crear la cuenta.");
        } finally {
            setLoading(false);
        }
    }

    const handleClose = () => {
        setOpen(false);
        router.replace("/auth/login");
    };

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
                            ¡Únete a nuestro equipo!
                        </Typography>

                        <Typography variant="body1" sx={{color: "text.primary", fontWeight: 400, lineHeight: 1.6}}>
                            Crea tu cuenta en <strong>Yo Reparo</strong> y comienza a gestionar tus reparaciones y
                            servicios de forma rápida y eficiente.
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
                            Crear cuenta
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: "text.secondary",
                                mb: 4,
                                textAlign: "center"
                            }}>
                            Ingresa tus datos para registrarte en la plataforma.
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleRegister}
                             sx={{maxWidth: {xs: '100%', md: '80%'}, margin: "auto"}}>
                            <TextField
                                label="Nombre completo"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                fullWidth
                                autoComplete="name"
                                sx={{mb: 2}}
                            />
                            <TextField
                                label="Teléfono"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                fullWidth
                                autoComplete="tel"
                                sx={{mb: 2}}
                            />
                            <TextField
                                label="Correo electrónico"
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

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                fullWidth
                                disableElevation
                                sx={{my: 2}}
                            >
                                {loading ? <CircularProgress size={24} color="inherit"/> : "Registrarse"}
                            </Button>
                        </Box>

                        <Typography variant='body2' sx={{textAlign: "center", color: "text.secondary", mt: 2}}>
                            ¿Ya tienes cuenta?{' '}
                            <Button
                                onClick={() => router.push('/auth/login')}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    p: 0,
                                    minWidth: 'auto',
                                    '&:hover': {background: 'transparent', textDecoration: 'underline'}
                                }}
                            >
                                Da clic aquí para iniciar sesión
                            </Button>
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
            <React.Fragment>
                <Dialog
                    open={open}
                    slots={{
                        transition: Transition,
                    }}
                    keepMounted
                    onClose={handleClose}
                    aria-describedby="alert-dialog-slide-description"
                    role="alertdialog"
                >
                    <DialogTitle>{"Por favor verifique su Email"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                          Hemos enviado una liga de confirmación a su correo electrónico, por favor, revise su bandeja de entrada para confirmar la creación de su cuenta
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{margin: 'auto', minWidth: '80%'}}>
                        <Button variant='contained' size='large' fullWidth onClick={handleClose}>Aceptar</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        </>
    );
}