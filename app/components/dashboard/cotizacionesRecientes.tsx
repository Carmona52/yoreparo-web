"use client";

import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {Cotizaciones} from "@/lib/types/cotizaciones";

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    pendiente: {bg: "rgba(245,124,0,0.12)", color: "#E65100", label: "Pendiente"},
    enviada: {bg: "rgba(21,101,192,0.12)", color: "#1565C0", label: "Enviada"},
    aceptada: {bg: "rgba(46,125,50,0.12)", color: "#2E7D32", label: "Aceptada"},
    rechazada: {bg: "rgba(211,47,47,0.12)", color: "#C62828", label: "Rechazada"},
};

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {day: "2-digit", month: "short", year: "numeric"});
}

export default function CotizacionesRecientes({cotizaciones}: { cotizaciones: Cotizaciones[] }) {
    const router = useRouter();

    return (
        <Card sx={{borderRadius: 4, border: "1px solid rgba(0,0,0,0.07)", height: "100%"}}>
            <CardContent sx={{p: 3}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}>
                    <AssignmentIcon sx={{fontSize: 18, color: "#5A5A72"}}/>
                    <Typography variant="body2" fontWeight={700}>Cotizaciones recientes</Typography>
                    <Chip label={cotizaciones.length} size="small"
                          sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: "rgba(0,0,0,0.06)",
                              color: "#5A5A72",
                              ml: "auto"
                          }}/>
                </Box>

                {cotizaciones.length === 0 ? (
                    <Box sx={{textAlign: "center", py: 4}}>
                        <Typography variant="body2" color="text.secondary">Sin cotizaciones recientes</Typography>
                    </Box>
                ) : (
                    <Box sx={{display: "flex", flexDirection: "column"}}>
                        {cotizaciones.map((c, i) => {
                            const key = c.estado?.toLowerCase().trim();
                            const style = ESTADO_STYLES[key] ?? {
                                bg: "rgba(0,0,0,0.06)",
                                color: "#5A5A72",
                                label: c.estado
                            };
                            return (
                                <Box key={c.id}>
                                    <Box
                                        onClick={() => router.push(`/dashboard/cotizaciones/${c.id}`)}
                                        sx={{
                                            py: 1.5,
                                            cursor: "pointer",
                                            borderRadius: 2,
                                            px: 1,
                                            mx: -1,
                                            transition: "background 0.15s",
                                            "&:hover": {bgcolor: "rgba(0,0,0,0.03)"}
                                        }}
                                    >
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            mb: 0.5
                                        }}>
                                            <Typography variant="body2" fontWeight={700} flex={1} pr={1} noWrap>
                                                {c.servicio ?? "Servicio"}
                                            </Typography>
                                            <Chip label={style.label} size="small"
                                                  sx={{
                                                      bgcolor: style.bg,
                                                      color: style.color,
                                                      fontWeight: 700,
                                                      fontSize: 10,
                                                      height: 20,
                                                      flexShrink: 0
                                                  }}/>
                                        </Box>
                                        <Box sx={{display: "flex", gap: 1.5, flexWrap: "wrap"}}>
                                            {c.direccion && (
                                                <Box sx={{display: "flex", alignItems: "center", gap: 0.5}}>
                                                    <LocationOnIcon sx={{fontSize: 12, color: "#5A5A72"}}/>
                                                    <Typography variant="caption" color="text.secondary"
                                                                noWrap>{c.direccion}</Typography>
                                                </Box>
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                {formatFecha(c.created_at)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {i < cotizaciones.length - 1 && <Divider/>}
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}