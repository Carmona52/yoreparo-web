import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import ImageIcon from "@mui/icons-material/Image";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Card from "@mui/material/Card";
import {useRouter} from "next/navigation";
import Chip from "@mui/material/Chip";
import {Cotizaciones} from "@/lib/types/cotizaciones";

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

export default function CardCotizacion(c: Cotizaciones) {
    const router = useRouter();
    return (
        <Card sx={{height: "100%"}}>
            <CardActionArea
                onClick={() => router.push(`/dashboard/cotizaciones/${c.id}`)}
                sx={{height: "100%"}}>
                {c.evidencia_url ? (
                    <Box
                        component="img"
                        src={c.evidencia_url}
                        alt={c.servicio}
                        sx={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <Box sx={{
                        width: "100%", height: 100,
                        bgcolor: "rgba(255,214,0,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <ImageIcon sx={{fontSize: 36, color: "rgba(255,214,0,0.4)"}}/>
                    </Box>
                )}
                <CardContent sx={{p: 3}}>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5
                    }}>
                        <Typography fontWeight={700} fontSize={15} sx={{flex: 1, pr: 1}} noWrap>
                            {c.servicio ?? "Sin servicio"}
                        </Typography>
                        <EstadoChip estado={c.estado}/>
                    </Box>

                    {c.descripcion && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                            sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}>
                            {c.descripcion}
                        </Typography>
                    )}

                    <Divider sx={{mb: 2}}/>

                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <AttachMoneyIcon sx={{fontSize: 15, color: "#2E7D32"}}/>
                            <Typography variant="body2" color="text.secondary">
                                Costo estimado:&nbsp;
                                <Typography component="span" variant="body2" fontWeight={700}
                                            color="text.primary">
                                    {c.costo_estimado ? `$${c.costo_estimado}` : "—"}
                                </Typography>
                            </Typography>
                        </Box>

                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <LocationOnIcon sx={{fontSize: 15, color: "#F57C00"}}/>
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {c.direccion ?? "—"}
                            </Typography>
                        </Box>

                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <CalendarTodayIcon sx={{fontSize: 15, color: "#1565C0"}}/>
                            <Typography variant="body2" color="text.secondary">
                                {formatFecha(c.fecha_preferida)}
                            </Typography>
                        </Box>

                    </Box>

                </CardContent>
            </CardActionArea>
        </Card>
    )
}