"use client";

import {useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import SendIcon from "@mui/icons-material/Send";
import GavelIcon from "@mui/icons-material/Gavel";
import {supabase} from "@/lib/supabase/supabase";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Mensaje {
    id: string;
    sender_role: "cliente" | "admin";
    content: string;
    precio_propuesto: number | null;
    created_at: string;
}

type ApelacionEstado = "activa" | "aceptada" | "cerrada_sin_acuerdo" | null | undefined;

interface CotizacionUpdate {
    apelacion_estado?: ApelacionEstado;
    [key: string]: unknown;
}

interface SeccionApelacionProps {
    cotizacionId: string;
    senderRole: "cliente" | "admin";
    costo: string;
    apelacionEstado?: ApelacionEstado;
    // user_id del destinatario de la notificación (el otro lado del chat)
    recipientUserId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-MX", {
        hour: "2-digit", minute: "2-digit", hour12: true,
    });

// ── Componente ────────────────────────────────────────────────────────────────

export default function SeccionApelacion({
                                             cotizacionId,
                                             senderRole,
                                             costo,
                                             apelacionEstado,
                                             recipientUserId,
                                         }: SeccionApelacionProps) {
    const [mensajes, setMensajes]               = useState<Mensaje[]>([]);
    const [texto, setTexto]                     = useState("");
    const [precioPropuesto, setPrecioPropuesto] = useState("");
    const [loading, setLoading]                 = useState(true);
    const [sending, setSending]                 = useState(false);
    const [cerrando, setCerrando]               = useState(false);
    const [error, setError]                     = useState<string | null>(null);
    const [estadoLocal, setEstadoLocal]         = useState<ApelacionEstado>(apelacionEstado);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEstadoLocal(apelacionEstado);
    }, [apelacionEstado]);

    // ── Carga inicial + Realtime ──────────────────────────────────────────────
    useEffect(() => {
        if (!cotizacionId) return;

        const cargarMensajes = async () => {
            setLoading(true);
            setError(null);
            const {data, error: err} = await supabase
                .from("cotizacion_mensajes")
                .select("*")
                .eq("cotizacion_id", cotizacionId)
                .order("created_at", {ascending: true});

            if (err) {
                setError("No se pudieron cargar los mensajes: " + err.message);
            } else {
                setMensajes(data ?? []);
            }
            setLoading(false);
        };

        cargarMensajes();

        // Canal 1: nuevos mensajes
        const chatChannel = supabase
            .channel(`chat-${cotizacionId}-${senderRole}`)   // nombre único por rol
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "cotizacion_mensajes",
                    filter: `cotizacion_id=eq.${cotizacionId}`,
                },
                (payload) => {
                    const nuevo = payload.new as Mensaje;
                    setMensajes((prev) => {
                        // evitar duplicados
                        if (prev.some((m) => m.id === nuevo.id)) return prev;
                        return [...prev, nuevo];
                    });
                }
            )
            .subscribe();

        // Canal 2: cambios de estado en la cotización
        const statusChannel = supabase
            .channel(`apelacion-status-${cotizacionId}-${senderRole}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "cotizaciones",
                    filter: `id=eq.${cotizacionId}`,
                },
                (payload) => {
                    const nuevo = payload.new as CotizacionUpdate;
                    if (nuevo.apelacion_estado !== undefined) {
                        setEstadoLocal(nuevo.apelacion_estado);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(chatChannel);
            supabase.removeChannel(statusChannel);
        };
    }, [cotizacionId, senderRole]);

    // Auto-scroll al último mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [mensajes]);

    // ── Enviar notificación al otro lado ─────────────────────────────────────
    const notificarRecipiente = async (contenido: string, tienePropuesta: boolean) => {
        if (!recipientUserId) return;
        const titulo = senderRole === "admin"
            ? tienePropuesta ? "💰 Nueva propuesta de precio" : "📩 Respuesta del administrador"
            : "📩 Nuevo mensaje en tu apelación";
        const cuerpo = tienePropuesta
            ? `Se propuso un nuevo precio en tu cotización.`
            : contenido.slice(0, 80);

        await supabase.functions.invoke("send-notification", {
            body: {
                user_id: recipientUserId,
                title: titulo,
                body: cuerpo,
                data: `cotizaciones/${cotizacionId}`,
            },
        });
    };

    const handleSend = async () => {
        const trimmed = texto.trim();
        if (!trimmed) return;

        setSending(true);
        setError(null);

        let precioNum: number | null = null;
        if (senderRole === "admin" && precioPropuesto.trim()) {
            const parsed = parseFloat(precioPropuesto);
            if (!isNaN(parsed) && parsed > 0) precioNum = parsed;
        }

        const nuevoMensaje = {
            cotizacion_id: cotizacionId,
            sender_role: senderRole,
            content: trimmed,
            precio_propuesto: precioNum,
        };

        const {data: inserted, error: err} = await supabase
            .from("cotizacion_mensajes")
            .insert(nuevoMensaje)
            .select()
            .single();

        if (err) {
            setError("Error al enviar el mensaje: " + err.message);
        } else {
            setMensajes((prev) => {
                if (prev.some((m) => m.id === inserted.id)) return prev;
                return [...prev, inserted as Mensaje];
            });
            setTexto("");
            setPrecioPropuesto("");
            notificarRecipiente(trimmed, precioNum !== null);
        }
        setSending(false);
    };

    const handleCerrarSinAcuerdo = async () => {
        const ok = window.confirm(
            "¿Cerrar la apelación sin acuerdo? El cliente no podrá apelar de nuevo."
        );
        if (!ok) return;

        setCerrando(true);
        setError(null);

        const {error: err1} = await supabase
            .from("cotizaciones")
            .update({en_apelacion: false, apelacion_estado: "cerrada_sin_acuerdo"})
            .eq("id", cotizacionId);

        if (err1) {
            setError("Error al cerrar la apelación: " + err1.message);
            setCerrando(false);
            return;
        }

        const mensajeCierre = {
            cotizacion_id: cotizacionId,
            sender_role: "admin" as const,
            content: "❌ La apelación ha sido cerrada. No se llegó a un acuerdo.",
            precio_propuesto: null,
        };

        const {data: inserted, error: err2} = await supabase
            .from("cotizacion_mensajes")
            .insert(mensajeCierre)
            .select()
            .single();

        if (!err2 && inserted) {
            setMensajes((prev) => {
                if (prev.some((m) => m.id === inserted.id)) return prev;
                return [...prev, inserted as Mensaje];
            });
        }

        if (recipientUserId) {
            await supabase.functions.invoke("send-notification", {
                body: {
                    user_id: recipientUserId,
                    title: "❌ Apelación cerrada",
                    body: "El administrador cerró la apelación sin acuerdo.",
                    data: `cotizaciones/${cotizacionId}`,
                },
            });
        }

        setEstadoLocal("cerrada_sin_acuerdo");
        setCerrando(false);
    };

    // ── Estado derivado ───────────────────────────────────────────────────────
    const apelacionCerrada =
        estadoLocal === "cerrada_sin_acuerdo" || estadoLocal === "aceptada";

    // ── Render burbuja ────────────────────────────────────────────────────────
    const renderBurbuja = (m: Mensaje) => {
        const esMio = m.sender_role === senderRole;
        return (
            <Box
                key={m.id}
                sx={{display: "flex", justifyContent: esMio ? "flex-end" : "flex-start"}}
            >
                <Box
                    sx={{
                        maxWidth: "75%",
                        // Burbuja propia: azul; ajena: gris claro en light, gris oscuro en dark
                        bgcolor: esMio ? "#1565C0" : "action.hover",
                        borderRadius: esMio
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                        px: 2,
                        py: 1.2,
                        border: esMio ? "none" : "1px solid",
                        borderColor: esMio ? "transparent" : "divider",
                    }}
                >
                    {/* Rol */}
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            mb: 0.3,
                            fontWeight: 700,
                            color: esMio ? "rgba(255,255,255,0.7)" : "text.secondary",
                        }}
                    >
                        {m.sender_role === "admin" ? "Administrador" : "Cliente"}
                    </Typography>

                    {/* Contenido */}
                    <Typography
                        variant="body2"
                        sx={{
                            lineHeight: 1.5,
                            color: esMio ? "#fff" : "text.primary"
                        }}>
                        {m.content}
                    </Typography>

                    {/* Badge precio propuesto */}
                    {m.precio_propuesto !== null && m.precio_propuesto > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "rgba(46,125,50,0.15)",
                                borderRadius: 1,
                                px: 1,
                                py: 0.5,
                                mt: 1,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{color: "#2E7D32", fontWeight: 800}}
                            >
                                💰 Nueva propuesta: ${m.precio_propuesto}
                            </Typography>
                        </Box>
                    )}

                    {/* Hora */}
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            mt: 0.5,
                            textAlign: "right",
                            color: esMio ? "rgba(255,255,255,0.6)" : "text.disabled",
                        }}
                    >
                        {formatHora(m.created_at)}
                    </Typography>
                </Box>
            </Box>
        );
    };

    // ── JSX ───────────────────────────────────────────────────────────────────
    return (
        <Card
            sx={{
                borderRadius: 1,
                border: "1px solid rgba(21,101,192,0.25)",
                bgcolor: "rgba(21,101,192,0.03)",
            }}
        >
            <CardContent sx={{p: 3}}>

                {/* Header */}
                <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                        <Box
                            sx={{
                                width: 40, height: 40, borderRadius: 1, bgcolor: "#1565C0",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <GavelIcon sx={{color: "#fff", fontSize: 20}}/>
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: 15
                                }}>Apelación de Precio</Typography>
                            <Typography variant="caption" sx={{
                                color: "text.secondary"
                            }}>
                                Presupuesto en disputa: <strong>${costo}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Badge de estado */}
                    {apelacionCerrada && (
                        <Typography
                            variant="caption"
                            sx={{
                                bgcolor: estadoLocal === "aceptada"
                                    ? "rgba(46,125,50,0.1)"
                                    : "rgba(211,47,47,0.1)",
                                color: estadoLocal === "aceptada" ? "#2E7D32" : "#C62828",
                                fontWeight: 700,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                            }}
                        >
                            {estadoLocal === "aceptada" ? "✓ Resuelta" : "✗ Cerrada sin acuerdo"}
                        </Typography>
                    )}
                </Box>

                <Divider sx={{mb: 2}}/>

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{mb: 2}} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Lista de mensajes */}
                <Box
                    sx={{
                        height: 320,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        mb: 2,
                        px: 0.5,
                    }}
                >
                    {loading ? (
                        <Box sx={{display: "flex", justifyContent: "center", mt: 4}}>
                            <CircularProgress size={24}/>
                        </Box>
                    ) : mensajes.length === 0 ? (
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                textAlign: "center",
                                mt: 4
                            }}>
                            {apelacionCerrada
                                ? "No hubo mensajes en esta apelación."
                                : senderRole === "admin"
                                    ? "El cliente aún no ha escrito. Espera su primer mensaje."
                                    : "Apelación iniciada. Escribe tu argumento para comenzar."}
                        </Typography>
                    ) : (
                        mensajes.map(renderBurbuja)
                    )}
                    <div ref={bottomRef}/>
                </Box>

                {/* Input — solo si está activa */}
                {!apelacionCerrada && (
                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>

                        {/* Campo precio propuesto (solo admin) */}
                        {senderRole === "admin" && (
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Nuevo precio a proponer (opcional)"
                                value={precioPropuesto}
                                onChange={(e) => setPrecioPropuesto(e.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Typography sx={{ color: "success.main", fontWeight: 700 }}>$</Typography>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                        )}

                        <Box sx={{display: "flex", gap: 1, alignItems: "flex-end"}}>
                            <TextField
                                fullWidth
                                multiline
                                maxRows={3}
                                size="small"
                                placeholder={
                                    senderRole === "admin"
                                        ? "Responde al cliente..."
                                        : "Escribe tu argumento..."
                                }
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                sx={{"& .MuiOutlinedInput-root": {borderRadius: 2}}}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSend}
                                disabled={sending || !texto.trim()}
                                sx={{
                                    minWidth: 48,
                                    minHeight: 40,
                                    borderRadius: 2,
                                    bgcolor: "#1565C0",
                                    "&:hover": {bgcolor: "#0D47A1"},
                                }}>
                                {sending
                                    ? <CircularProgress size={18} color="inherit"/>
                                    : <SendIcon fontSize="small"/>}
                            </Button>
                        </Box>

                        {senderRole === "admin" && (
                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                disabled={cerrando}
                                onClick={handleCerrarSinAcuerdo}
                                sx={{borderRadius: 2, mt: 0.5}}
                            >
                                {cerrando
                                    ? <CircularProgress size={18} color="inherit"/>
                                    : "Cerrar sin acuerdo"}
                            </Button>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}