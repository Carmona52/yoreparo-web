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
import SendIcon from "@mui/icons-material/Send";
import GavelIcon from "@mui/icons-material/Gavel";
import {supabase} from "@/lib/supabase/supabase";

interface Mensaje {
    id: string;
    sender_role: "cliente" | "admin";
    content: string;
    created_at: string;
}

interface SeccionApelacionProps {
    cotizacionId: string;
    senderRole: "cliente" | "admin"; // quién está viendo
    costo: string;
}

export default function SeccionApelacion({cotizacionId, senderRole, costo}: SeccionApelacionProps) {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [texto, setTexto] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Cargar mensajes iniciales
    useEffect(() => {
        const cargarMensajes = async () => {
            setLoading(true);
            const {data} = await supabase
                .from("cotizacion_mensajes")
                .select("*")
                .eq("cotizacion_id", cotizacionId)
                .order("created_at", {ascending: true});
            setMensajes(data ?? []);
            setLoading(false);
        };
        cargarMensajes();

        // Realtime: escuchar nuevos mensajes
        const channel = supabase
            .channel(`chat-${cotizacionId}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "cotizacion_mensajes",
                filter: `cotizacion_id=eq.${cotizacionId}`,
            }, (payload) => {
                setMensajes((prev) => [...prev, payload.new as Mensaje]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [cotizacionId]);

    // Auto-scroll al último mensaje
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [mensajes]);

    const handleSend = async () => {
        const trimmed = texto.trim();
        if (!trimmed) return;

        setSending(true);
        const {error} = await supabase.from("cotizacion_mensajes").insert({
            cotizacion_id: cotizacionId,
            sender_role: senderRole,
            content: trimmed,
        });

        if (!error) setTexto("");
        setSending(false);
    };

    const formatHora = (iso: string) =>
        new Date(iso).toLocaleTimeString("es-MX", {hour: "2-digit", minute: "2-digit", hour12: true});

    return (
        <Card sx={{borderRadius: 1, border: "1px solid rgba(21,101,192,0.25)", bgcolor: "rgba(21,101,192,0.03)"}}>
            <CardContent sx={{p: 3}}>
                {/* Header */}
                <Box sx={{display: "flex", alignItems: "center", gap: 1.5, mb: 2}}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: 1, bgcolor: "#1565C0",
                        display: "flex", alignItems: "center", justifyContent: "center"
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

                <Divider sx={{mb: 2}}/>

                {/* Mensajes */}
                <Box sx={{
                    height: 320, overflowY: "auto", display: "flex",
                    flexDirection: "column", gap: 1.5, mb: 2, px: 0.5
                }}>
                    {loading ? (
                        <Box sx={{display: "flex", justifyContent: "center", mt: 4}}>
                            <CircularProgress size={24}/>
                        </Box>
                    ) : mensajes.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" mt={4}>
                            Aún no hay mensajes. Escribe tu argumento para iniciar la apelación.
                        </Typography>
                    ) : (
                        mensajes.map((m) => {
                            const esMio = m.sender_role === senderRole;
                            return (
                                <Box key={m.id} sx={{
                                    display: "flex",
                                    justifyContent: esMio ? "flex-end" : "flex-start"
                                }}>
                                    <Box sx={{
                                        maxWidth: "75%",
                                        bgcolor: esMio ? "#1565C0" : "rgba(0,0,0,0.06)",
                                        color: esMio ? "#fff" : "text.primary",
                                        borderRadius: esMio ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                        px: 2, py: 1.2,
                                    }}>
                                        <Typography variant="caption" sx={{
                                            opacity: 0.7, display: "block", mb: 0.3, fontWeight: 600
                                        }}>
                                            {m.sender_role === "admin" ? "Administrador" : "Cliente"}
                                        </Typography>
                                        <Typography variant="body2" lineHeight={1.5}>{m.content}</Typography>
                                        <Typography variant="caption"
                                                    sx={{opacity: 0.6, display: "block", mt: 0.5, textAlign: "right"}}>
                                            {formatHora(m.created_at)}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })
                    )}
                    <div ref={bottomRef}/>
                </Box>

                {/* Input */}
                <Box sx={{display: "flex", gap: 1}}>
                    <TextField
                        fullWidth multiline maxRows={3}
                        placeholder={senderRole === "cliente"
                            ? "Explica por qué el precio te parece elevado..."
                            : "Responde al cliente..."
                        }
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
                        variant="contained" onClick={handleSend}
                        disabled={sending || !texto.trim()}
                        sx={{minWidth: 48, borderRadius: 2, bgcolor: "#1565C0", "&:hover": {bgcolor: "#0D47A1"}}}
                    >
                        {sending ? <CircularProgress size={18} color="inherit"/> : <SendIcon fontSize="small"/>}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}