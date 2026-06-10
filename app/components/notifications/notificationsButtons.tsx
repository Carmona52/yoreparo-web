"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Badge from "@mui/material/Badge";

export default function NotificacionesBtn() {
    const { estado, solicitarPermiso, desactivar } = usePushNotifications();

    if (estado === "no_soportado") return null;

    const config = {
        idle: {
            icon: <NotificationsIcon />,
            tip: "Activar notificaciones",
            color: "white",
            hoverBg: "action.hover",
            action: solicitarPermiso
        },
        solicitando: {
            icon: <CircularProgress size={20} color="inherit" />,
            tip: "Solicitando permiso...",
            color: "warning.main",
            hoverBg: "transparent",
            action: undefined
        },
        activo: {
            icon: (
                <Badge color="success" variant="dot" overlap="circular">
                    <NotificationsActiveIcon />
                </Badge>
            ),
            tip: "Notificaciones activas (Click para desactivar)",
            color: "yellow",
            hoverBg: "action.hover",
            action: desactivar
        },
        denegado: {
            icon: <NotificationsOffIcon />,
            tip: "Notificaciones bloqueadas en el navegador",
            color: "error.main",
            hoverBg: "transparent",
            action: undefined
        },
        error: {
            icon: <NotificationsOffIcon />,
            tip: "Error al activar notificaciones (Click para reintentar)",
            color: "error.main",
            hoverBg: "action.hover",
            action: solicitarPermiso
        },
    } as const;

    const { icon, tip, color, hoverBg, action } = config[estado] ?? config.idle;
    const isDisabled = estado === "solicitando" || estado === "denegado";

    return (
        <Tooltip title={tip} placement="right" arrow>
            <span style={{ display: "inline-block" }}>
                <IconButton
                    size="medium" 
                    onClick={action}
                    disabled={isDisabled}
                    sx={{
                        color: color,
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                            bgcolor: hoverBg,
                            transform: isDisabled ? "none" : "scale(1.08)"
                        },
                        "&.Mui-disabled": {
                            color: estado === "denegado" ? "error.light" : "action.disabled",
                            opacity: 0.6
                        }
                    }}>
                    {icon}
                </IconButton>
            </span>
        </Tooltip>
    );
}