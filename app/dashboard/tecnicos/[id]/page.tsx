"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {tecnicosService} from "@/lib/data/tecnicos";
import {herramientasService} from "@/lib/data/herramientas";
import {User} from "@/lib/types/user";
import {Servicios} from "@/lib/types/servicios";
import {Herramienta, HerramientaEstado} from "@/lib/types/herramienta";

import TecnicoPerfil from "@/components/tecnicos/TecnicoPerfil";
import TecnicoTrabajos from "@/components/tecnicos/TecnicoTrabajos";
import TecnicoHerramientas from "@/components/tecnicos/TecnicoHerramientas";

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
    const [trabajos, setTrabajos] = useState<Servicios[]>([]);
    const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
        open: false, msg: "", severity: "success",
    });

    useEffect(() => {
        Promise.all([
            tecnicosService.getDetailsTecnico(id),
            tecnicosService.getJobsByTecnico(id),
            herramientasService.getByTecnico(id),
        ])
            .then(([perfil, jobs, tools]) => {
                setTecnico(perfil);
                setTrabajos(jobs);
                setHerramientas(tools);
            })
            .catch(() => setError("No se pudieron cargar los datos del técnico"))
            .finally(() => setLoading(false));
    }, [id]);

    function handleEstadoCambiado(hid: string, estado: HerramientaEstado) {
        setHerramientas((prev) => prev.map((h) => h.id === hid ? {...h, estado} : h));
        setSnack({open: true, msg: `Herramienta marcada como ${estado}`, severity: "success"});
    }

    function handleEliminada(hid: string) {
        setHerramientas((prev) => prev.filter((h) => h.id !== hid));
        setSnack({open: true, msg: "Herramienta eliminada", severity: "success"});
    }

    function handleCreada(h: Herramienta) {
        setHerramientas((prev) => [h, ...prev]);
        setSnack({open: true, msg: `"${h.tool}" registrada como prestada`, severity: "success"});
    }

    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    if (error || !tecnico) return (
        <Alert severity="error" sx={{mt: 2}}>{error ?? "Técnico no encontrado"}</Alert>
    );

    const stats = [
        {
            label: "En proceso",
            value: trabajos.filter((j) => j.status?.toLowerCase() === "en proceso").length,
            color: "#1565C0",
            bg: "rgba(21,101,192,0.08)"
        },
        {
            label: "Finalizados",
            value: trabajos.filter((j) => j.status?.toLowerCase() === "finalizado").length,
            color: "#2E7D32",
            bg: "rgba(46,125,50,0.08)"
        },
        {label: "Herramientas", value: herramientas.length, color: "#B8860B", bg: "rgba(255,214,0,0.12)"},
    ];

    return (
        <Box sx={{maxWidth: screen, mx: "auto"}}>
            <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 3}}>
                <IconButton onClick={() => router.back()} size="small" sx={{bgcolor: "rgba(0,0,0,0.05)"}}>
                    <ArrowBackIcon fontSize="small"/>
                </IconButton>
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 600
                    }}>
                    Detalle del técnico
                </Typography>
            </Box>
            <TecnicoPerfil tecnico={tecnico} stats={stats}/>
            <TecnicoHerramientas
                workerId={id}
                herramientas={herramientas}
                onEstadoCambiado={handleEstadoCambiado}
                onEliminada={handleEliminada}
                onCreada={handleCreada}/>
            <TecnicoTrabajos trabajos={trabajos}/>
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