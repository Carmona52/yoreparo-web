"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import {cotizacionesService} from "@/lib/data/cotizaciones";
import {Cotizaciones} from "@/lib/types/cotizaciones";
import CrearJobModal from "@/components/jobs/newJobModal";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {supabase} from "@/lib/supabase/supabase";

const GeneradorPresupuesto = dynamic(
    () => import("@/components/pdf/GeneradorPresupuesto"),
    {ssr: false, loading: () => <Box sx={{p: 4, textAlign: "center"}}><CircularProgress sx={{color: "#FFD600"}}/></Box>}
);

function normalizeEstado(estado: string) {
    return estado?.toLowerCase().trim() ?? "";
}

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    pendiente: {bg: "rgba(245,124,0,0.12)", color: "#E65100", label: "Pendiente"},
    enviada: {bg: "rgba(21,101,192,0.12)", color: "#1565C0", label: "Enviada"},
    aceptada: {bg: "rgba(46,125,50,0.12)", color: "#2E7D32", label: "Aceptada"},
    rechazada: {bg: "rgba(211,47,47,0.12)", color: "#C62828", label: "Rechazada"},
    asignada: {bg: "rgb(61,198,40)", color: "#ffffff", label: "Asignada"},
};

function EstadoChip({estado}: { estado: string }) {
    const key = normalizeEstado(estado);
    const style = ESTADO_STYLES[key] ?? {bg: "rgba(0,0,0,0.07)", color: "#5A5A72", label: estado ?? "—"};
    return (<Chip label={style.label} size="medium"
                  sx={{bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: 16, height: 32, p: 3}}/>);
}

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

async function getTécnicoPorCotizacion(cotizacionId: string): Promise<string | null> {
    try {
        const {data: cotizacion, error: errorCoti} = await supabase
            .from("cotizaciones")
            .select("job_id")
            .eq("id", cotizacionId)
            .single();

        if (errorCoti || !cotizacion?.job_id) {
            console.error("Error al obtener job_id de la cotización:", errorCoti);
            return null;
        }

        const {data: job, error: errorJob} = await supabase
            .from("jobs")
            .select("worker_id")
            .eq("id", cotizacion.job_id)
            .single();

        if (errorJob || !job?.worker_id) {
            console.error("Error al obtener worker_id del job:", errorJob);
            return null;
        }

        const {data: perfil, error: errorPerfil} = await supabase
            .from("profiles")
            .select("name")
            .eq("id", job.worker_id)
            .single();

        if (errorPerfil) {
            console.error("Error al obtener nombre del perfil:", errorPerfil);
            return null;
        }

        return perfil?.name ?? null;
    } catch (err) {
        console.error("Error inesperado:", err);
        return null;
    }
}

function SeccionEnviada({costo}: { costo: string }) {
    return (
        <Card sx={{borderRadius: 1, border: "1px solid rgba(245,124,0,0.25)", bgcolor: "rgba(245,124,0,0.04)"}}>
            <CardContent sx={{p: 4, textAlign: "center"}}>
                <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 1,
                    bgcolor: "#F57C00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2
                }}>
                    <AccessTimeIcon sx={{fontSize: 34, color: "#fff"}}/>
                </Box>
                <Typography variant="h6" fontWeight={800} mb={1}>Esperando Respuesta</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    El presupuesto por <strong>${costo}</strong> ha sido enviado exitosamente
                    al cliente y se encuentra en revisión. Te notificaremos en cuanto
                    el cliente emita una respuesta.
                </Typography>
            </CardContent>
        </Card>
    );
}

function SeccionAceptada({costo, cotizacion, onJobCreado}: {
    costo: string;
    cotizacion: Cotizaciones;
    onJobCreado: () => void
}) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <Card sx={{borderRadius: 1, border: "1px solid rgba(46,125,50,0.25)", bgcolor: "rgba(46,125,50,0.04)"}}>
                <CardContent sx={{p: 4, textAlign: "center"}}>
                    <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 1,
                        bgcolor: "#2E7D32",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 2
                    }}>
                        <CheckCircleIcon sx={{fontSize: 34, color: "#fff"}}/>
                    </Box>
                    <Typography variant="h6" fontWeight={800} mb={1}>¡Cotización Aceptada!</Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={3}>
                        El cliente ha aprobado formalmente el presupuesto de{" "}
                        <strong>${costo}</strong>. Es el momento de asignar un técnico
                        calificado para llevar a cabo el servicio solicitado.
                    </Typography>
                    <Button
                        fullWidth variant="contained" size="large"
                        endIcon={<PersonAddIcon/>}
                        onClick={() => setModalOpen(true)}
                        sx={{
                            py: 1.5, fontSize: 15, fontWeight: 800, borderRadius: 1,
                            bgcolor: "#2E7D32", color: "#fff",
                            "&:hover": {bgcolor: "#1B5E20"},
                        }}
                    >
                        Asignar Técnico
                    </Button>
                </CardContent>
            </Card>

            <CrearJobModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={onJobCreado}
                cotizacion={cotizacion}
            />
        </>
    );
}

function SeccionAsignada({ costo, cotizacion }: { costo: string; cotizacion: Cotizaciones }) {
    const [tecnicoNombre, setTecnicoNombre] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargarTecnico() {
            if (!cotizacion.id) return;
            setCargando(true);
            const nombre = await getTécnicoPorCotizacion(cotizacion.id);
            setTecnicoNombre(nombre);
            setCargando(false);
        }
        cargarTecnico();
    }, [cotizacion.id]);

    return (
        <Card sx={{ borderRadius: 1, border: "1px solid rgba(46,125,50,0.25)", bgcolor: "rgba(46,125,50,0.04)" }}>
            <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 1, bgcolor: "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 34, color: "#fff" }} />
                </Box>
                <Typography variant="h6" fontWeight={800} mb={1}>¡Trabajo Asignado!</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={3}>
                    El cliente ha aprobado el presupuesto de <strong>${costo}</strong> y el trabajo ha sido asignado al siguiente técnico:
                </Typography>
                {cargando ? (
                    <CircularProgress size={24} />
                ) : tecnicoNombre ? (
                    <Typography variant="h6" fontWeight={700} color="#2E7D32">
                        {tecnicoNombre}
                    </Typography>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        Técnico no asignado aún.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}


function SeccionRechazada() {
    return (
        <Card sx={{borderRadius: 1, border: "1px solid rgba(211,47,47,0.25)", bgcolor: "rgba(211,47,47,0.04)"}}>
            <CardContent sx={{p: 4, textAlign: "center"}}>
                <Typography variant="h6" fontWeight={800} mb={1} color="#C62828">Cotización Rechazada</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    El cliente ha declinado el presupuesto enviado. Puedes contactarlo
                    para revisar los términos y generar una nueva propuesta si es necesario.
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function CotizacionDetallePage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();
    const [cotizacion, setCotizacion] = useState<Cotizaciones | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        cotizacionesService.getCotizacionById(id)
            .then(setCotizacion)
            .catch(() => setError("No se pudo cargar la cotización"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    if (error || !cotizacion) return (
        <Alert severity="error" sx={{mt: 2}}>{error ?? "Cotización no encontrada"}</Alert>
    );

    const estado = normalizeEstado(cotizacion.estado);

    function handleEnviado(costo: string) {
        setCotizacion((prev) => prev ? {...prev, estado: "Enviada", costo_estimado: costo} : prev);
    }

    function handleJobCreado() {
        router.push("/dashboard/servicios");
    }

    return (
        <Box sx={{maxWidth: screen, mx: "auto", marginX: 2}}>

            <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 3}}>
                <IconButton onClick={() => router.back()} size="small" sx={{bgcolor: "rgba(0,0,0,0.05)"}}>
                    <ArrowBackIcon fontSize="small"/>
                </IconButton>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Detalle de la Cotización
                </Typography>
            </Box>

            <Card sx={{borderRadius: 1, border: "1px solid rgba(0,0,0,0.07)", mb: 3}}>
                <CardContent sx={{p: 3}}>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5}}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {cotizacion.created_by ?? "Cliente"}
                        </Typography>
                        <EstadoChip estado={cotizacion.estado}/>
                    </Box>

                    <Typography variant="h5" fontWeight={800} color="text.primary" mb={2}>
                        {cotizacion.servicio ?? "Servicio"}
                    </Typography>

                    <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1.5}}>
                        <LocationOnIcon sx={{fontSize: 18, color: "#1565C0"}}/>
                        <Typography variant="body2" color="text.secondary">{cotizacion.direccion ?? "—"}</Typography>
                    </Box>

                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <CalendarTodayIcon sx={{fontSize: 17, color: "#1565C0"}}/>
                        <Typography variant="body2"
                                    color="text.secondary">{formatFecha(cotizacion.fecha_preferida)}</Typography>
                    </Box>

                    <Divider sx={{my: 2.5}}/>

                    <Typography variant="overline" color="text.secondary" display="block" mb={1}>
                        Descripción del problema
                    </Typography>
                    <Typography variant="body2" color="text.primary" lineHeight={1.8}>
                        {cotizacion.descripcion ?? "Sin descripción"}
                    </Typography>

                    {cotizacion.evidencia_url && (
                        <>
                            <Divider sx={{my: 2.5}}/>
                            <Typography variant="overline" color="text.secondary" display="block" mb={1.5}>
                                Evidencia fotográfica
                            </Typography>
                            <Box
                                component="img"
                                src={cotizacion.evidencia_url}
                                alt="Evidencia"
                                sx={{
                                    width: "100%",
                                    borderRadius: 1,
                                    objectFit: "cover",
                                    maxHeight: 560,
                                    border: "1px solid rgba(0,0,0,0.08)"
                                }}
                            />
                        </>
                    )}

                    {cotizacion.pdf_url && (
                        <>
                            <Divider sx={{my: 2.5}}/>
                            <Button
                                fullWidth variant="outlined"
                                startIcon={<PictureAsPdfIcon/>}
                                onClick={() => window.open(cotizacion.pdf_url, "_blank")}
                                sx={{
                                    borderRadius: 1,
                                    borderColor: "#1565C0",
                                    color: "#1565C0",
                                    fontWeight: 600,
                                    "&:hover": {bgcolor: "rgba(21,101,192,0.06)"}
                                }}
                            >
                                Ver Documento de Presupuesto
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {estado === "pendiente" && (
                <GeneradorPresupuesto cotizacion={cotizacion} onEnviado={handleEnviado}/>
            )}
            {estado === "enviada" && (
                <SeccionEnviada costo={cotizacion.costo_estimado ?? "—"}/>
            )}
            {estado === "aceptada" && (
                <SeccionAceptada
                    costo={cotizacion.costo_estimado ?? "—"}
                    cotizacion={cotizacion}
                    onJobCreado={handleJobCreado}
                />
            )}
            {estado === "asignada" && (
                <SeccionAsignada
                    costo={cotizacion.costo_estimado ?? "—"}
                    cotizacion={cotizacion}
                />
            )}
            {estado === "rechazada" && <SeccionRechazada/>}
        </Box>
    );
}