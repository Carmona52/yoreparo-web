'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/libs/supabase';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Box,
    CircularProgress,
} from '@mui/material';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                setError('El enlace no es válido o ha expirado. Solicita un nuevo restablecimiento.');
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                console.log('Modo recuperación activado');
            }
        });

        checkSession();
        return () => subscription.unsubscribe();
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Contraseña actualizada correctamente. Por favor vuelva a la app');
            await supabase.auth.signOut();
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Crear nueva contraseña
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Ingresa tu nueva contraseña para la cuenta de administrador.
                </Typography>

                <Box component="form" onSubmit={handleReset} noValidate>
                    <TextField
                        label="Nueva contraseña"
                        type="password"
                        fullWidth
                        required
                        margin="normal"
                        value={password}
                        error={password !== confirmPassword && confirmPassword !== ''}
                        helperText={password !== confirmPassword && confirmPassword !== '' ? "Las contraseñas no coinciden" : ""}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <TextField
                        label="Confirmar contraseña"
                        type="password"
                        fullWidth
                        required
                        margin="normal"
                        value={confirmPassword}
                        error={password !== confirmPassword && confirmPassword !== ''}
                        helperText={password !== confirmPassword && confirmPassword !== '' ? "Las contraseñas no coinciden" : ""}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                    />

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 3, py: 1.2 }}>
                        {loading ? <CircularProgress size={24} /> : 'Actualizar contraseña'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}