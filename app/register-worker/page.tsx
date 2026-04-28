"use client";

import {useState} from "react";
import {
    Box,
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    Paper,
    Typography,
    IconButton,
    InputAdornment,
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {supabase} from "@/lib/supabase/supabase";

type Role = "worker" | "supervisor" | "owner";


export async function createWorkerByAdmin(
    email: string,
    password: string,
    name: string,
    phone: string,
    role: 'worker' | 'supervisor' | 'owner'
) {
    const {data, error} = await supabase.functions.invoke('quick-endpoint', {
        body: {
            email,
            password,
            name,
            phone,
            role
        }
    });

    if (error) {
        console.error("Error en la Edge Function:", error);
        throw new Error(error.message || 'Error al crear el trabajador');
    }

    if (data && data.error) {
        throw new Error(data.error);
    }

    return data;
}

export default function WorkersPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState<Role>("worker");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({open: false, message: "", severity: "success"});

    const resetForm = () => {
        setEmail("");
        setName("");
        setPhone("");
        setPassword("");
        setRole("worker");
        setShowPassword(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({...prev, open: false}));
    };

    const createWorker = async () => {
        if (!email || !name || !password) {
            setSnackbar({
                open: true,
                message: "Nombre, correo y contraseña son obligatorios",
                severity: "error",
            });
            return;
        }

        setLoading(true);
        try {
            const {data, error} = await createWorkerByAdmin(
                email,
                password,
                name,
                phone,
                role
            );
            if (error) {
                setSnackbar({
                    open: true,
                    message: typeof error === "string" ? error : JSON.stringify(error),
                    severity: "error",
                });
                return;
            }
            setSnackbar({
                open: true,
                message: "Trabajador creado correctamente",
                severity: "success",
            });
            resetForm();
        } catch (err) {
            setSnackbar({
                open: true,
                message:  "Error inesperado",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                bgcolor: "background.default",
                p: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 500,
                    width: "100%",
                    p: 4,
                    borderRadius: 3,
                }}
            >
                <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
                    Crear Trabajador
                </Typography>

                <TextField
                    label="Nombre completo *"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                />

                <TextField
                    label="Correo electrónico *"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="off"
                />

                <TextField
                    label="Teléfono"
                    fullWidth
                    margin="normal"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                />

                <TextField
                    label="Contraseña *"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />


                <Button
                    fullWidth
                    variant="contained"
                    onClick={createWorker}
                    disabled={loading}
                    sx={{
                        mt: 3,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        bgcolor: "#0a7ea4",
                        "&:hover": {bgcolor: "#096b8c"},
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit"/> : "Crear Trabajador"}
                </Button>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{width: "100%"}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}