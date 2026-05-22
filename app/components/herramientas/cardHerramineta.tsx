import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import InfoHerramientaModal from "@/components/herramientas/infoHerramientaModal";
import BuildIcon from "@mui/icons-material/Build";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import {Herramienta} from "@/lib/types/herramienta";
import {useState} from "react";

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    prestada: {bg: "rgba(245,124,0,0.12)", color: "#E65100", label: "Prestada"},
    'en inventario': {bg: "rgba(46,125,50,0.12)", color: "#2E7D32", label: "En Inventario"},
    rechazada: {bg: "rgba(211,47,47,0.12)", color: "#C62828", label: "Rechazada"},
    completada: {bg: "rgba(21,101,192,0.12)", color: "#1565C0", label: "Completada"},
};

function EstadoChip({estado}: { estado: string }) {
    const estadoNormalizado = estado?.toLowerCase();
    const style = ESTADO_STYLES[estadoNormalizado] ?? {
        bg: "rgba(0,0,0,0.07)",
        color: "#5A5A72",
        label: estado || "Desconocido",
    };

    return (
        <Chip
            label={style.label}
            size="small"
            sx={{
                bgcolor: style.bg,
                color: style.color,
                fontWeight: 700,
                fontSize: "0.75rem",
                height: 24,
                px: 0.5
            }}
        />
    );
}

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function HerramientasCard(props: Herramienta) {
    const {tool, estado, worker_id, created_at, trabajador, fecha_prestamo} = props;

    const isPrestado = estado?.toLowerCase() === "prestada";
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);

    return (
        <>
            <Card elevation={0}
                onClick={handleOpen}
                sx={{
                    p: 2.5,
                    mb: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                        transform: "translateY(-2px)",
                    }
                }}>
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2}}>
                    <Box sx={{display: "flex", gap: 2, alignItems: "center"}}>
                        <Avatar sx={{bgcolor: "primary.50", color: "primary.main", width: 40, height: 40}}>
                            <BuildIcon fontSize="small"/>
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{fontSize: "1.1rem", fontWeight: 600, color: "text.primary"}}>
                                {tool || "Herramienta sin nombre"}
                            </Typography>
                        </Box>
                    </Box>
                    <EstadoChip estado={estado}/>
                </Box>

                <Divider sx={{mb: 2, borderStyle: "dashed"}}/>

                <Box sx={{display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary"}}>
                        <PersonOutlineIcon sx={{fontSize: 18}}/>
                        <Typography variant="body2" sx={{fontWeight: 500}}>
                            {isPrestado && worker_id
                                ? `Prestada a ${trabajador?.name || 'Desconocido'} el día ${formatFecha(fecha_prestamo)}`
                                : "Disponible en almacén"
                            }
                        </Typography>
                    </Box>

                    <Box sx={{display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary"}}>
                        <CalendarTodayIcon sx={{fontSize: 16}}/>
                        <Typography variant="body2">
                            Registrada: {formatFecha(created_at)}
                        </Typography>
                    </Box>
                </Box>
            </Card>

            <InfoHerramientaModal
                open={open}
                onClose={() => setOpen(false)}
                herramienta={props}
            />
        </>
    );
}