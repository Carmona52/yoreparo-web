"use client";

import {useState} from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import HandymanIcon from "@mui/icons-material/Handyman";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {herramientasService} from "@/lib/data/herramientas";
import {Herramienta, HerramientaEstado} from "@/lib/types/herramienta";

const ESTILOS: Record<HerramientaEstado, { color: string; bg: string }> = {
    Prestada: {color: "#1565C0", bg: "rgba(21,101,192,0.10)"},
    Dañada: {color: "#E65100", bg: "rgba(245,124,0,0.10)"},
    Perdida: {color: "#C62828", bg: "rgba(211,47,47,0.10)"},
};

type Props = {
    h: Herramienta;
    onEstadoCambiado: (id: string, estado: HerramientaEstado) => void;
    onEliminada: (id: string) => void;
};

export default function HerramientaRow({h, onEstadoCambiado, onEliminada}: Props) {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const [loading, setLoading] = useState(false);
    const estilo = ESTILOS[h.estado] ?? ESTILOS.Prestada;

    async function cambiarEstado(estado: HerramientaEstado) {
        setAnchor(null);
        setLoading(true);
        try {
            await herramientasService.actualizarEstado(h.id, estado);
            onEstadoCambiado(h.id, estado);
        } finally {
            setLoading(false);
        }
    }

    async function eliminar() {
        setAnchor(null);
        setLoading(true);
        try {
            await herramientasService.eliminar(h.id);
            onEliminada(h.id);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box sx={{
            display: "flex", alignItems: "center", gap: 2,
            py: 1.5, px: 2, borderRadius: 2.5,
            bgcolor: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.05)",
        }}>
            <Box sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: estilo.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
            }}>
                <HandymanIcon sx={{fontSize: 18, color: estilo.color}}/>
            </Box>

            <Typography variant="body2" fontWeight={600} flex={1} noWrap>
                {h.tool}
            </Typography>

            <Chip label={h.estado} size="small"
                  sx={{bgcolor: estilo.bg, color: estilo.color, fontWeight: 700, fontSize: 11, height: 22}}/>

            {loading ? (
                <CircularProgress size={18} sx={{color: "#FFD600", flexShrink: 0}}/>
            ) : (
                <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
                    <MoreVertIcon fontSize="small"/>
                </IconButton>
            )}

            <Menu
                anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
                PaperProps={{sx: {borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: 160}}}
            >
                <Typography variant="caption" color="text.secondary"
                            sx={{
                                px: 2,
                                pt: 1,
                                pb: 0.5,
                                display: "block",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                fontSize: 10
                            }}>
                    Cambiar estado
                </Typography>
                {(["Prestada", "Dañada", "Perdida"] as HerramientaEstado[])
                    .filter((e) => e !== h.estado)
                    .map((e) => (
                        <MenuItem key={e} onClick={() => cambiarEstado(e)} sx={{fontSize: 13, gap: 1}}>
                            <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: ESTILOS[e].color,
                                flexShrink: 0
                            }}/>
                            Marcar como {e}
                        </MenuItem>
                    ))}
                <Divider sx={{my: 0.5}}/>
                <MenuItem onClick={eliminar} sx={{fontSize: 13, color: "#C62828"}}>
                    Eliminar registro
                </MenuItem>
            </Menu>
        </Box>
    );
}