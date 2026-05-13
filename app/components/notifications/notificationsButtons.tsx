"use client";

import {usePushNotifications} from "@/hooks/usePushNotifications";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

export default function NotificacionesBtn() {
    const {estado, solicitarPermiso, desactivar} = usePushNotifications();

    if (estado === "no_soportado") return null;

    const config = {
        idle: {
            icon: <NotificationsIcon/>,
            tip: "Activar notificaciones",
            color: "rgba(255,255,255,0.5)",
            action: solicitarPermiso
        },
        solicitando: {
            icon: <CircularProgress size={18} sx={{color: "#FFD600"}}/>,
            tip: "Solicitando permiso...",
            color: "transparent",
            action: undefined
        },
        activo: {
            icon: <NotificationsActiveIcon/>,
            tip: "Notificaciones activas · Click para desactivar",
            color: "#FFD600",
            action: desactivar
        },
        denegado: {
            icon: <NotificationsOffIcon/>,
            tip: "Notificaciones bloqueadas en el navegador",
            color: "#EF9F9F",
            action: undefined
        },
        error: {
            icon: <NotificationsOffIcon/>,
            tip: "Error al activar notificaciones",
            color: "#EF9F9F",
            action: solicitarPermiso
        },
    } as const;

    const {icon, tip, color, action} = config[estado] ?? config.idle;

    return (
        <Tooltip title={tip} placement="right">
            <span>
                <IconButton
                    size="small"
                    onClick={action}
                    disabled={estado === "solicitando" || estado === "denegado"}
                    sx={{color, "&:hover": {bgcolor: "rgba(255,255,255,0.08)"}}}
                >
                    {icon}
                </IconButton>
            </span>
        </Tooltip>
    );
}