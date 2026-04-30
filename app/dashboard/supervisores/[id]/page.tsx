"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {tecnicosService} from "@/lib/data/tecnicos";
import {User} from "@/lib/types/user";
import SupervisorPerfil from "@/components/supervisores/SupervisorPerfil";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function TecnicoDetallePage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();

    const [tecnico, setTecnico] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
        open: false, msg: "", severity: "success",
    });

    useEffect(() => {
        Promise.all([
            tecnicosService.getDetailsTecnico(id),

        ])
            .then(([perfil]) => {
                setTecnico(perfil);

            })
            .catch(() => setError("No se pudieron cargar los datos del técnico"))
            .finally(() => setLoading(false));
    }, [id]);


    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    if (error || !tecnico) return (
        <Alert severity="error" sx={{mt: 2}}>{error ?? "Técnico no encontrado"}</Alert>
    );


    return (
        <Box sx={{maxWidth: screen, mx: "auto"}}>
            <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 3}}>
                <IconButton onClick={() => router.back()} size="small" sx={{bgcolor: "rgba(0,0,0,0.05)"}}>
                    <ArrowBackIcon fontSize="small"/>
                </IconButton>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Detalle del supervisor
                </Typography>
            </Box>

            <SupervisorPerfil tecnico={tecnico}/>


            <Snackbar
                open={snack.open} autoHideDuration={3000}
                onClose={() => setSnack((s) => ({...s, open: false}))}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}>
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({...s, open: false}))}
                       sx={{borderRadius: 3, fontWeight: 600}}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}