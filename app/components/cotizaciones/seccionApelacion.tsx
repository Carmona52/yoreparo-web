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

interface Mensaje {
    id: string;
    sender_role: "cliente" | "admin";
    content: string;
    precio_propuesto: number | null;
    created_at: string;
}

interface SeccionApelacionProps {
    cotizacionId: string;
    senderRole: "cliente" | "admin";
    costo: string;
    apelacionEstado?: string | null;
}

export default function SeccionApelacion({
                                             cotizacionId,
                                             senderRole,
                                             costo,
                                             apelacionEstado,
                                         }: SeccionApelacionProps) {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [texto, setTexto] = useState("");
    const [precioPropuesto, setPrecioPropuesto] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [cerrando, setCerrando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [estadoLocal, setEstadoLocal] = useState(apelacionEstado);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEstadoLocal(apelacionEstado);
    }, [apelacionEstado]);

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

        // Realtime
        const channel = supabase
            .channel(`chat-${cotizacionId}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "cotizacion_mensajes",
                filter: `cotizacion_id=eq.${cotizacionId}`,
            }, (payload) => {
                setMensajes((prev) => {
                    // Evitar duplicados si el insert fue nuestro
                    const existe = prev.some(m => m.id === (payload.new as Mensaje).id);
                    if (existe) return prev;
                    return [...prev, payload.new as Mensaje];
                });
            })
            .subscribe();

        // Realtime en cotizacion para detectar cambio de estado
        const statusChannel = supabase
            .channel(`apelacion-status-web-${cotizacionId}`)
            .on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "cotizaciones",
                filter: `id=eq.${cotizacionId}`,
            }, (payload) => {
                const nuevo = payload.new as any;
                if (nuevo.apelacion_estado) setEstadoLocal(nuevo.apelacion_estado);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(statusChannel);
        };
    }, [cotizacionId]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [mensajes]);

    const handleSend = async () => {
        const trimmed = texto.trim();
        if (!trimmed) return;

        setSending(true);
        setError(null);

        const payload: any = {
            cotizacion_id: cotizacionId,
            sender_role: senderRole,
            content: trimmed,
            precio_propuesto: null, // siempre incluir aunque sea null
        };

        // Si el admin puso un precio propuesto
        if (senderRole === "admin" && precioPropuesto.trim()) {
            const parsed = parseFloat(precioPropuesto);
            if (!isNaN(parsed) && parsed > 0) {
                payload.precio_propuesto = parsed;
            }
        }

        const {error: err} = await supabase
            .from("cotizacion_mensajes")
            .insert(payload);

        if (err) {
            setError("Error al enviar el mensaje: " + err.message);
        } else {
            setTexto("");
            setPrecioPropuesto("");
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
            .update({
                en_apelacion: false,
                apelacion_estado: "cerrada_sin_acuerdo",
            })
            .eq("id", cotizacionId);

        if (err1) {
            setError("Error al cerrar la apelación: " + err1.message);
            setCerrando(false);
            return;
        }

        const {error: err2} = await supabase
            .from("cotizacion_mensajes")
            .insert({
                cotizacion_id: cotizacionId,
                sender_role: "admin",
                content: "❌ La apelación ha sido cerrada. No se llegó a un acuerdo.",
                precio_propuesto: null,
            });

        if (err2) console.error("Error insertando mensaje de cierre:", err2.message);

        setEstadoLocal("cerrada_sin_acuerdo");
        setCerrando(false);
    };

    const formatHora = (iso: string) =>
        new Date(iso).toLocaleTimeString("es-MX", {
            hour: "2-digit", minute: "2-digit", hour12: true,
        });

    const apelacionCerrada = estadoLocal === "cerrada_sin_acuerdo" || estadoLocal === "aceptada";

    return (
        <Card sx={{borderRadius: 1, border: "1px solid rgba(21,101,192,0.25)", bgcolor: "rgba(21,101,192,0.03)"}}>
            <CardContent sx={{p: 3}}>

                {/* Header */}
                <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1.5}}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 1, bgcolor: "#1565C0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <GavelIcon sx={{color: "#fff", fontSize: 20}}/>
                        </Box>
                        <Box>
                            <Typography fontWeight={800} fontSize={15}>Apelación de Precio</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Presupuesto en disputa: <strong>${costo}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Badge de estado */}
                    {apelacionCerrada && (
                        <Typography variant="caption" sx={{
                            bgcolor: estadoLocal === "aceptada"
                                ? "rgba(46,125,50,0.1)" : "rgba(211,47,47,0.1)",
                            color: estadoLocal === "aceptada" ? "#2E7D32" : "#C62828",
                            fontWeight: 700, px: 1.5, py: 0.5, borderRadius: 2,
                        }}>
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

                {/* Mensajes */}
                <Box sx={{
                    height: 320, overflowY: "auto", display: "flex",
                    flexDirection: "column", gap: 1.5, mb: 2, px: 0.5,
                }}>
                    {loading ? (
                        <Box sx={{display: "flex", justifyContent: "center", mt: 4}}>
                            <CircularProgress size={24}/>
                        </Box>
                    ) : mensajes.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                            {apelacionCerrada
                                ? "No hubo mensajes en esta apelación."
                                : "El cliente aún no ha escrito. Espera su primer mensaje."}
                        </Typography>
                    ) : (
                        mensajes.map((m) => {
                            const esMio = m.sender_role === senderRole;
                            return (
                                <Box key={m.id} sx={{
                                    display: "flex",
                                    justifyContent: esMio ? "flex-end" : "flex-start",
                                }}>
                                    <Box sx={{
                                        maxWidth: "75%",
                                        bgcolor: esMio ? "#1565C0" : "rgba(0,0,0,0.06)",
                                        color: esMio ? "#fff" : "text.primary",
                                        borderRadius: esMio
                                            ? "16px 16px 4px 16px"
                                            : "16px 16px 16px 4px",
                                        px: 2, py: 1.2,
                                    }}>
                                        <Typography variant="caption" sx={{
                                            opacity: 0.7, display: "block", mb: 0.3, fontWeight: 600,
                                        }}>
                                            {m.sender_role === "admin" ? "Administrador" : "Cliente"}
                                        </Typography>
                                        <Typography variant="body2" lineHeight={1.5}>
                                            {m.content}
                                        </Typography>
                                        {m.precio_propuesto && (
                                            <Box sx={{
                                                display: "flex", alignItems: "center", gap: 0.5,
                                                bgcolor: "rgba(46,125,50,0.15)", borderRadius: 1,
                                                px: 1, py: 0.5, mt: 1,
                                            }}>
                                                <Typography variant="caption" sx={{
                                                    color: "#2E7D32", fontWeight: 800,
                                                }}>
                                                    💰 Nueva propuesta: ${m.precio_propuesto}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Typography variant="caption" sx={{
                                            opacity: 0.6, display: "block", mt: 0.5, textAlign: "right",
                                        }}>
                                            {formatHora(m.created_at)}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })
                    )}
                    <div ref={bottomRef}/>
                </Box>

                {/* Input — solo si la apelación sigue activa */}
                {!apelacionCerrada && (
                    <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>

                        {/* Campo de precio propuesto (solo admin) */}
                        {senderRole === "admin" && (
                            <TextField
                                fullWidth size="small"
                                type="number"
                                placeholder="Nuevo precio a proponer (opcional)"
                                value={precioPropuesto}
                                onChange={(e) => setPrecioPropuesto(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography color="success.main" fontWeight={700}>$</Typography>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{"& .MuiOutlinedInput-root": {borderRadius: 2}}}
                            />
                        )}

                        {/* Mensaje + botones */}
                        <Box sx={{display: "flex", gap: 1, alignItems: "flex-end"}}>
                            <TextField
                                fullWidth multiline maxRows={3}
                                placeholder={senderRole === "admin"
                                    ? "Responde al cliente..."
                                    : "Escribe tu argumento..."}
                                value={texto}
                                onChange={(e) => setTexto(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                size="small"
                                sx={{"& .MuiOutlinedInput-root": {borderRadius: 2}}}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSend}
                                disabled={sending || !texto.trim()}
                                sx={{
                                    minWidth: 48, minHeight: 40, borderRadius: 2,
                                    bgcolor: "#1565C0", "&:hover": {bgcolor: "#0D47A1"},
                                }}
                            >
                                {sending
                                    ? <CircularProgress size={18} color="inherit"/>
                                    : <SendIcon fontSize="small"/>}
                            </Button>
                        </Box>

                        {/* Botón cerrar — solo admin */}
                        {senderRole === "admin" && (
                            <Button
                                variant="outlined" color="error" fullWidth
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