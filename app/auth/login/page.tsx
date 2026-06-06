"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

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
        <Box sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                p: 2,}}>
            <Card sx={{width: "100%", maxWidth: 420}}>
                <CardContent sx={{p: 4}}>
                    <Typography variant="h5">
                        Bienvenido
                    </Typography>
                    <Typography variant="body2" color="text.secondary" >
                        Inicia sesión para continuar
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{mb: 3}}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleLogin}>
                        <TextField
                            label="Correo electrónico"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            autoComplete="email"
                        sx={{my:2}}/>
                        <TextField label="Contraseña"
                                   type="password"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   required
                                   fullWidth
                                   autoComplete="current-password"
                        sx={{mb:2}}/>

                        <Button type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                fullWidth
                                sx={{mt: 1}}>
                            {loading ? <CircularProgress size={22} color="inherit"/> : "Iniciar sesión"}
                        </Button>
                    </Box>

                </CardContent>
            </Card>
        </Box>
    );
}