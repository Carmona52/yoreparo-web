import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import BuildIcon from "@mui/icons-material/Build";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {Servicios} from "@/lib/types/servicios";

const ESTADO_JOB: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
    pendiente: {
        color: "#E65100",
        bg: "rgba(245,124,0,0.12)",
        label: "Pendiente",
        icon: <HourglassEmptyIcon sx={{fontSize: 13}}/>
    },
    "en proceso": {
        color: "#1565C0",
        bg: "rgba(21,101,192,0.12)",
        label: "En proceso",
        icon: <BuildCircleIcon sx={{fontSize: 13}}/>
    },
    finalizado: {
        color: "#2E7D32",
        bg: "rgba(46,125,50,0.12)",
        label: "Finalizado",
        icon: <CheckCircleIcon sx={{fontSize: 13}}/>
    },
};

function getEstado(status: string) {
    return ESTADO_JOB[status?.toLowerCase()] ?? ESTADO_JOB["pendiente"];
}

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {day: "2-digit", month: "short", year: "numeric"});
}

export default function TecnicoTrabajos({trabajos}: { trabajos: Servicios[] }) {
    const router = useRouter();

    return (
        <Card sx={{borderRadius: 4, border: "1px solid rgba(0,0,0,0.07)", mb: 3}}>
            <CardContent sx={{p: 3}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}>
                    <BuildIcon sx={{fontSize: 18, color: "#5A5A72"}}/>
                    <Typography variant="body2" fontWeight={700}>Trabajos asignados</Typography>
                    <Chip label={trabajos.length} size="small"
                          sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: "rgba(0,0,0,0.06)",
                              color: "#5A5A72"
                          }}/>
                </Box>

                {trabajos.length === 0 ? (
                    <Box sx={{textAlign: "center", py: 4}}>
                        <BuildCircleIcon sx={{fontSize: 40, color: "rgba(0,0,0,0.12)", mb: 1}}/>
                        <Typography variant="body2" color="text.secondary">Sin trabajos asignados</Typography>
                    </Box>
                ) : (
                    <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
                        {trabajos.map((j) => {
                            const est = getEstado(j.status);
                            return (
                                <Card key={j.id} variant="outlined"
                                      sx={{
                                          borderRadius: 3,
                                          cursor: "pointer",
                                          transition: "box-shadow 0.2s",
                                          "&:hover": {boxShadow: "0 2px 8px rgba(0,0,0,0.08)"}
                                      }}
                                      onClick={() => router.push(`/dashboard/servicios/${j.id}`)}
                                >
                                    <CardContent sx={{p: "14px 16px !important"}}>
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            mb: 0.5
                                        }}>
                                            <Typography variant="body2" fontWeight={700} flex={1} pr={1} noWrap>
                                                {j.title}
                                            </Typography>
                                            <Chip
                                                label={est.label} size="small"
                                                icon={<Box sx={{
                                                    color: `${est.color} !important`,
                                                    display: "flex",
                                                    pl: 0.5
                                                }}>{est.icon}</Box>}
                                                sx={{
                                                    bgcolor: est.bg,
                                                    color: est.color,
                                                    fontWeight: 700,
                                                    fontSize: 10,
                                                    height: 22,
                                                    flexShrink: 0
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{display: "flex", gap: 2, flexWrap: "wrap"}}>
                                            {j.address && (
                                                <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                                                    <LocationOnIcon sx={{fontSize: 12, color: "#5A5A72"}}/>
                                                    <Typography variant="caption" color="text.secondary"
                                                                noWrap>{j.address}</Typography>
                                                </Box>
                                            )}
                                            {j.fecha_cita && (
                                                <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                                                    <CalendarTodayIcon sx={{fontSize: 12, color: "#5A5A72"}}/>
                                                    <Typography variant="caption"
                                                                color="text.secondary">{formatFecha(j.fecha_cita)}</Typography>
                                                </Box>
                                            )}
                                            {j.price != null && (
                                                <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                                                    <AttachMoneyIcon sx={{fontSize: 12, color: "#2E7D32"}}/>
                                                    <Typography variant="caption" fontWeight={600} color="#2E7D32">
                                                        ${Number(j.price).toLocaleString("es-MX")}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}