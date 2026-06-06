"use client";

import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {Servicios} from "@/lib/types/servicios";

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {day: "2-digit", month: "short"});
}

export default function JobsPendientesAsignar({jobs}: { jobs: Servicios[] }) {
    const router = useRouter();

    return (
        <Card sx={{ border: "1px solid rgba(0,0,0,0.07)", height: "100%"}}>
            <CardContent sx={{p: 3}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 2}}>
                    <PersonOffIcon sx={{fontSize: 18, color: "#E65100"}}/>
                    <Typography variant="body2" sx={{
                        fontWeight: 700
                    }}>Sin técnico asignado</Typography>
                    {jobs.length > 0 && (
                        <Chip label={jobs.length} size="small"
                              sx={{
                                  height: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  bgcolor: "rgba(211,47,47,0.1)",
                                  color: "#C62828",
                                  ml: "auto"
                              }}/>
                    )}
                </Box>

                {jobs.length === 0 ? (
                    <Box sx={{textAlign: "center", py: 4}}>
                        <Typography variant="body2" sx={{
                            color: "text.secondary"
                        }}>
                            Todos los trabajos tienen técnico asignado ✓
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{display: "flex", flexDirection: "column"}}>
                        {jobs.map((j, i) => (
                            <Box key={j.id}>
                                <Box
                                    onClick={() => router.push(`/dashboard/servicios/${j.id}`)}
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
                                    <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                                        <Avatar sx={{
                                            width: 34,
                                            height: 34,
                                            bgcolor: "rgba(211,47,47,0.1)",
                                            color: "#C62828",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            flexShrink: 0
                                        }}>
                                            {j.title?.charAt(0).toUpperCase() ?? "J"}
                                        </Avatar>
                                        <Box sx={{flex: 1, minWidth: 0}}>
                                            <Typography variant="body2" noWrap sx={{
                                                fontWeight: 700
                                            }}>{j.title}</Typography>
                                            <Box sx={{display: "flex", gap: 1.5, flexWrap: "wrap", mt: 0.3}}>
                                                {j.address && (
                                                    <Box sx={{display: "flex", alignItems: "center", gap: 0.4}}>
                                                        <LocationOnIcon sx={{fontSize: 11, color: "#5A5A72"}}/>
                                                        <Typography variant="caption" noWrap
                                                                    sx={{
                                                                        color: "text.secondary"
                                                                    }}>{j.address}</Typography>
                                                    </Box>
                                                )}
                                                {j.price != null && (
                                                    <Box sx={{display: "flex", alignItems: "center", gap: 0.4}}>
                                                        <AttachMoneyIcon sx={{fontSize: 11, color: "#2E7D32"}}/>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: "#2E7D32"
                                                            }}>
                                                            ${Number(j.price).toLocaleString("es-MX")}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                <Typography variant="caption" sx={{
                                                    color: "text.secondary"
                                                }}>
                                                    {formatFecha(j.fecha_cita)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                                {i < jobs.length - 1 && <Divider/>}
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}