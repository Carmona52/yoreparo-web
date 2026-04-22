"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {serviciosService, JobEstado} from "@/lib/data/servicios";
import {Servicios} from "@/lib/types/servicios";
import {User} from "@/lib/types/user";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";


const ESTADOS: { value: JobEstado; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
    {
        value: "Pendiente",
        label: "Pendiente",
        color: "#E65100",
        bg: "rgba(245,124,0,0.12)",
        icon: <HourglassEmptyIcon sx={{fontSize: 18}}/>,
    },
    {
        value: "en proceso",
        label: "En proceso",
        color: "#1565C0",
        bg: "rgba(21,101,192,0.12)",
        icon: <BuildCircleIcon sx={{fontSize: 18}}/>,
    },
    {
        value: "finalizado",
        label: "Finalizado",
        color: "#2E7D32",
        bg: "rgba(46,125,50,0.12)",
        icon: <CheckCircleIcon sx={{fontSize: 18}}/>,
    },
];

function getEstado(value: string) {
    return ESTADOS.find((e) => e.value.toLowerCase() === value?.toLowerCase())
        ?? ESTADOS[0];
}

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function SelectorEstado({
                            estadoActual,
                            onCambiar,
                            loading,
                        }: {
    estadoActual: string;
    onCambiar: (e: JobEstado) => void;
    loading: boolean;
}) {
    const actual = getEstado(estadoActual);

    return (
        <Card sx={{borderRadius: 1, border: "1px solid rgba(0,0,0,0.07)", mb: 3}}>
            <CardContent sx={{p: 3}}>
                <Typography variant="body2" fontWeight={700} mb={2}>
                    Estado del trabajo
                </Typography>

                <Box sx={{display: "flex", gap: 1.5, flexWrap: "wrap"}}>
                    {ESTADOS.map((e) => {
                        const isActive = e.value.toLowerCase() === estadoActual?.toLowerCase();
                        return (
                            <Tooltip key={e.value} title={isActive ? "Estado actual" : `Cambiar a ${e.label}`}>
                                <Box
                                    component="button"
                                    onClick={() => !isActive && !loading && onCambiar(e.value)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:'space-between',
                                        gap: 1,
                                        px: 2,
                                        py: 1.2,
                                        border: "2px solid",
                                        borderColor: isActive ? e.color : "rgba(0,0,0,0.1)",
                                        borderRadius: 1,
                                        bgcolor: isActive ? e.bg : "transparent",
                                        color: isActive ? e.color : "#5A5A72",
                                        cursor: isActive || loading ? "default" : "pointer",
                                        fontWeight: isActive ? 800 : 500,
                                        fontSize: 13,
                                        fontFamily: "inherit",
                                        transition: "all 0.2s",
                                        opacity: loading ? 0.6 : 1,
                                        "&:hover": !isActive && !loading ? {
                                            borderColor: e.color,
                                            bgcolor: e.bg,
                                            color: e.color,
                                        } : {},
                                    }}
                                >
                                    <Box sx={{color: isActive ? e.color : "#5A5A72", display: "flex"}}>
                                        {e.icon}
                                    </Box>
                                    {e.label}
                                    {isActive && loading && (
                                        <CircularProgress size={12} sx={{color: e.color, ml: 0.5}}/>
                                    )}
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>

                <Box sx={{display: "flex", alignItems: "center", mt: 2.5, gap: 0}}>
                    {ESTADOS.map((e, i) => {
                        const idx = ESTADOS.findIndex(
                            (x) => x.value.toLowerCase() === estadoActual?.toLowerCase()
                        );
                        const done = i <= idx;
                        return (
                            <Box key={e.value} sx={{
                                display: "flex",
                                alignItems: "center",
                                flex: i < ESTADOS.length - 1 ? 1 : "none"
                            }}>
                                <Box sx={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    bgcolor: done ? e.color : "rgba(0,0,0,0.12)",
                                    flexShrink: 0,
                                    transition: "background 0.3s",
                                }}/>
                                {i < ESTADOS.length - 1 && (
                                    <Box sx={{
                                        flex: 1, height: 2,
                                        bgcolor: done && i < idx ? ESTADOS[i + 1].color : "rgba(0,0,0,0.08)",
                                        transition: "background 0.3s",
                                    }}/>
                                )}
                            </Box>
                        );
                    })}
                </Box>
                <Box sx={{display: "flex", justifyContent: "space-between", mt: 0.5}}>
                    {ESTADOS.map((e) => (
                        <Typography key={e.value} variant="caption" color="text.secondary" fontSize={10}>
                            {e.label}
                        </Typography>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}


export default function ServicioDetallePage() {
    const {id} = useParams<{ id: string }>();
    const router = useRouter();
    const supabase = createClient();

    const [servicio, setServicio] = useState<Servicios | null>(null);
    const [tecnico, setTecnico] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [cambiandoEstado, setCambiandoEstado] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({
        open: false, msg: "", severity: "success",
    });

    useEffect(() => {
        serviciosService.getDetailsServicio(id)
            .then(async (data) => {
                setServicio(data);
                if (data.worker_id) {
                    const {data: perfil} = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", data.worker_id)
                        .single();
                    if (perfil) setTecnico(perfil as User);
                }
            })
            .catch(() => setError("No se pudo cargar el servicio"))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleCambiarEstado(nuevoEstado: JobEstado) {
        if (!servicio) return;
        setCambiandoEstado(true);

        try {
            await serviciosService.updateEstado(id, nuevoEstado);

            if (servicio.worker_id) {
                await serviciosService.notificarTecnico(
                    servicio.worker_id,
                    servicio.title,
                    nuevoEstado
                );
                setSnack({
                    open: true,
                    msg: `Estado cambiado a "${nuevoEstado}" · Técnico notificado`,
                    severity: "success",
                });
            } else {
                setSnack({
                    open: true,
                    msg: `Estado cambiado a "${nuevoEstado}"`,
                    severity: "success",
                });
            }

            setServicio((prev) => prev ? {...prev, status: nuevoEstado} : prev);
        } catch {
            setSnack({open: true, msg: "Error al cambiar el estado", severity: "error"});
        } finally {
            setCambiandoEstado(false);
        }
    }

    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    if (error || !servicio) return (
        <Alert severity="error" sx={{mt: 2}}>{error ?? "Servicio no encontrado"}</Alert>
    );

    const estado = getEstado(servicio.status);

    return (
        <Box sx={{maxWidth: screen, mx: "auto", marginX: 2}}>

            <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 3}}>
                <IconButton onClick={() => router.back()} size="small" sx={{bgcolor: "rgba(0,0,0,0.05)"}}>
                    <ArrowBackIcon fontSize="small"/>
                </IconButton>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Detalle del Servicio
                </Typography>
            </Box>

            <SelectorEstado
                estadoActual={servicio.status}
                onCambiar={handleCambiarEstado}
                loading={cambiandoEstado}
            />

            <Card sx={{borderRadius: 1, border: "1px solid rgba(0,0,0,0.07)", mb: 3}}>
                <CardContent sx={{p: 0, "&:last-child": {pb: 0}}}>

                    {servicio.image_url ? (
                        <Box
                            component="img"
                            src={servicio.image_url}
                            alt={servicio.title}
                            sx={{width: "100%", height: 220, objectFit: "cover", borderRadius: "16px 16px 0 0"}}
                        />
                    ) : (
                        <Box sx={{
                            width: "100%", height: 100,
                            bgcolor: "rgba(255,214,0,0.08)",
                            borderRadius: "16px 16px 0 0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <BuildCircleIcon sx={{fontSize: 48, color: "rgba(255,214,0,0.35)"}}/>
                        </Box>
                    )}

                    <Box sx={{p: 3}}>
                        {/* Título + estado */}
                        <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2}}>
                            <Typography variant="h5" fontWeight={800} color="text.primary" flex={1} pr={2}>
                                {servicio.title}
                            </Typography>
                            <Chip
                                label={estado.label}
                                icon={<Box sx={{
                                    color: `${estado.color} !important`,
                                    display: "flex",
                                    pl: 0.5
                                }}>{estado.icon}</Box>}
                                size="small"
                                sx={{
                                    bgcolor: estado.bg,
                                    color: estado.color,
                                    fontWeight: 700,
                                    fontSize: 12,
                                    height: 28
                                }}
                            />
                        </Box>

                        {/* Datos clave */}
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1.2, mb: 2.5}}>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                <AttachMoneyIcon sx={{fontSize: 17, color: "#2E7D32"}}/>
                                <Typography variant="body2" color="text.secondary">
                                    Precio:&nbsp;
                                    <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
                                        {servicio.price
                                            ? `$${servicio.price.toLocaleString("es-MX")}`
                                            : "—"}
                                    </Typography>
                                </Typography>
                            </Box>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                <LocationOnIcon sx={{fontSize: 17, color: "#F57C00"}}/>
                                <Typography variant="body2" color="text.secondary">
                                    {servicio.address ?? "—"}
                                </Typography>
                            </Box>
                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                <CalendarTodayIcon sx={{fontSize: 16, color: "#1565C0"}}/>
                                <Typography variant="body2" color="text.secondary">
                                    Cita: {formatFecha(servicio.fecha_cita)}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Descripción */}
                        {servicio.description && (
                            <>
                                <Divider sx={{mb: 2}}/>
                                <Typography variant="overline" color="text.secondary" display="block" mb={1}>
                                    Descripción
                                </Typography>
                                <Typography variant="body2" color="text.primary" lineHeight={1.8}>
                                    {servicio.description}
                                </Typography>
                            </>
                        )}

                        {/* Ir a cotización */}
                        {servicio.cotizacion_id && (
                            <>
                                <Divider sx={{my: 2.5}}/>
                                <Button
                                    fullWidth variant="outlined" size="medium"
                                    startIcon={<ReceiptIcon/>}
                                    onClick={() => router.push(`/dashboard/cotizaciones/${servicio.cotizacion_id}`)}
                                    sx={{
                                        borderRadius: 1, fontWeight: 700,
                                        borderColor: "#FFD600", color: "#B8860B",
                                        "&:hover": {bgcolor: "rgba(255,214,0,0.08)", borderColor: "#FFD600"},
                                    }}
                                >
                                    Ver cotización relacionada
                                </Button>
                            </>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* ── Técnico asignado ── */}
            <Card sx={{borderRadius: 1, border: "1px solid rgba(0,0,0,0.07)", mb: 3}}>
                <CardContent sx={{p: 3}}>
                    <Typography variant="body2" fontWeight={700} mb={2}>
                        Técnico asignado
                    </Typography>

                    {tecnico ? (
                        <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                            <Avatar sx={{
                                width: 52, height: 52,
                                bgcolor: "#FFD600", color: "#1A1A2E",
                                fontWeight: 800, fontSize: 20,
                            }}>
                                {tecnico.name?.charAt(0).toUpperCase() ?? "T"}
                            </Avatar>
                            <Box sx={{flex: 1, minWidth: 0}}>
                                <Typography fontWeight={700} fontSize={15}>
                                    {tecnico.name}
                                </Typography>
                                <Chip
                                    label={tecnico.role}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        height: 20,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        bgcolor: "rgba(255,214,0,0.15)",
                                        color: "#B8860B"
                                    }}
                                />
                            </Box>
                            {/* Notificar manualmente */}
                            <Tooltip title="Enviar notificación al técnico">
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        serviciosService.notificarTecnico(
                                            servicio.worker_id!,
                                            servicio.title,
                                            servicio.status as JobEstado
                                        ).then(() =>
                                            setSnack({
                                                open: true,
                                                msg: "Notificación enviada al técnico",
                                                severity: "info"
                                            })
                                        )
                                    }
                                    sx={{bgcolor: "rgba(255,214,0,0.12)", "&:hover": {bgcolor: "rgba(255,214,0,0.25)"}}}
                                >
                                    <NotificationsActiveIcon sx={{fontSize: 19, color: "#B8860B"}}/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Box sx={{p: 2, bgcolor: "rgba(0,0,0,0.03)", borderRadius: 1, textAlign: "center"}}>
                            <Typography variant="body2" color="text.secondary">
                                Sin técnico asignado
                            </Typography>
                        </Box>
                    )}

                    {tecnico && (
                        <>
                            <Divider sx={{my: 2}}/>
                            <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                    <PhoneIcon sx={{fontSize: 15, color: "#5A5A72"}}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {tecnico.phone ?? "—"}
                                    </Typography>
                                </Box>
                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                    <EmailIcon sx={{fontSize: 15, color: "#5A5A72"}}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {tecnico.email ?? "—"}
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Snackbar de feedback */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack((s) => ({...s, open: false}))}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert
                    severity={snack.severity}
                    onClose={() => setSnack((s) => ({...s, open: false}))}
                    sx={{borderRadius: 1, fontWeight: 600}}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}