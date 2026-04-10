'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Container, CircularProgress, Typography, Box } from '@mui/material';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error en callback:', error);
                router.push('/login?error=reset_link_invalid');
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const next = urlParams.get('next') || '/reset-password';
            router.push(next);
        };

        handleCallback();
    }, [router]);

    return (
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={48} />
                <Typography sx={{ mt: 2 }}>Verificando tu enlace, un momento...</Typography>
            </Box>
        </Container>
    );
}