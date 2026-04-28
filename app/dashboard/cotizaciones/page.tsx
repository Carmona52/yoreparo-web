'use client'

import {cotizacionesService} from "@/lib/data/cotizaciones";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Cotizaciones} from "@/lib/types/cotizaciones";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import CardCotizacion from "@/components/cotizaciones/cardCotizacion";

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    pendiente: {bg: "rgba(245,124,0,0.12)", color: "#E65100", label: "Pendiente"},
    aprobada: {bg: "rgba(46,125,50,0.12)", color: "#2E7D32", label: "Aprobada"},
    rechazada: {bg: "rgba(211,47,47,0.12)", color: "#C62828", label: "Rechazada"},
    completada: {bg: "rgba(21,101,192,0.12)", color: "#1565C0", label: "Completada"},
};

function EstadoChip({estado}: { estado: string }) {
    const style = ESTADO_STYLES[estado?.toLowerCase()] ?? {
        bg: "rgba(0,0,0,0.07)",
        color: "#5A5A72",
        label: estado ?? "—",
    };
    return (
        <Chip
            label={style.label}
            size="small"
            sx={{bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: 11, height: 22}}
        />
    );
}

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

export default function CotizacionesPage() {
    const router = useRouter();
    const [cotizaciones, setCotizaciones] = useState<Cotizaciones[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cotizacionesService.getAllCotizaciones()
            .then(setCotizaciones)
            .catch(() => setError("No se pudieron cargar las cotizaciones"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    if (error) return <Alert severity="error" sx={{mt: 2}}>{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" fontWeight={800} mb={1}>Cotizaciones</Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
                {cotizaciones.length} cotización{cotizaciones.length !== 1 ? "es" : ""} registradas
            </Typography>

            {cotizaciones.length === 0 ? (
                <Alert severity="info">No hay cotizaciones registradas</Alert>
            ) : (
                <Grid container spacing={2.5}>
                    {cotizaciones.map((c) => (
                        <Grid key={c.id} size={{xs: 12, md: 6, xl: 4}}>
                            <CardCotizacion id={c.id} servicio={c.servicio} estado={c.estado}
                                            costo_estimado={c.costo_estimado} evidencia_url={c.evidencia_url}
                                            descripcion={c.descripcion} created_by={c.created_by}
                                            created_at={c.created_at} pdf_url={c.pdf_url} job_id={c.job_id}
                                            direccion={c.direccion} fecha_preferida={c.fecha_preferida}/>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}