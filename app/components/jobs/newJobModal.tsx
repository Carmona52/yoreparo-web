"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Cotizaciones } from "@/lib/types/cotizaciones";
import { User } from "@/lib/types/user";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";

import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CheckIcon from "@mui/icons-material/Check";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    cotizacion: Cotizaciones;
};

type FormState = {
    title: string;
    description: string;
    address: string;
    worker_id: string;
    fecha_cita: string;
    price: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toLocalISO(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    return (
        `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:00` +
        `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`
    );
}

function buildInitialForm(cotizacion: Cotizaciones): FormState {
    const fecha = cotizacion.fecha_preferida
        ? new Date(cotizacion.fecha_preferida)
        : new Date();
    return {
        title:       cotizacion.servicio      ?? "",
        description: cotizacion.descripcion   ?? "",
        address:     cotizacion.direccion     ?? "",
        worker_id:   "",
        fecha_cita:  fecha.toISOString().slice(0, 16),
        price:       cotizacion.costo_estimado ?? "",
    };
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function CrearJobModal({ open, onClose, onSuccess, cotizacion }: Props) {
    const supabase = createClient();

    const [tecnicos,        setTecnicos]        = useState<User[]>([]);
    const [loadingTecnicos, setLoadingTecnicos] = useState(false);
    const [saving,          setSaving]          = useState(false);
    const [error,           setError]           = useState<string | null>(null);
    const [success,         setSuccess]         = useState(false);
    const [form,            setForm]            = useState<FormState>(() => buildInitialForm(cotizacion));

    // Cargar técnicos y resetear form al abrir
    useEffect(() => {
        if (!open) {
            setError(null);
            setSuccess(false);
            return;
        }

        setForm(buildInitialForm(cotizacion));

        async function cargarTecnicos() {
            setLoadingTecnicos(true);
            try {
                const { data, error: sbError } = await supabase
                    .from("profiles")
                    .select("*")
                    .neq("role", "cliente");
                if (!sbError && data) setTecnicos(data as User[]);
            } finally {
                setLoadingTecnicos(false);
            }
        }

        void cargarTecnicos();
    }, [open]);

    const tecnicoSeleccionado = tecnicos.find((t) => t.id === form.worker_id);

    // ── Guardar ───────────────────────────────────────────────────────────────

    async function handleGuardar() {
        if (!form.title.trim())   { setError("El título es requerido");    return; }
        if (!form.address.trim()) { setError("La dirección es requerida"); return; }
        if (!form.worker_id)      { setError("Selecciona un técnico");     return; }

        setSaving(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sin sesión activa");

            const { error: insertError } = await supabase.from("jobs").insert({
                title:         form.title,
                description:   form.description,
                address:       form.address,
                worker_id:     form.worker_id,
                fecha_cita:    toLocalISO(new Date(form.fecha_cita)),
                created_by:    user.id,
                status:        "Pendiente",
                cotizacion_id: cotizacion.id,
                price:         parseFloat(form.price) || 0,
                image_url:     cotizacion.evidencia_url ?? null,
            });

            if (insertError) throw insertError;

            // Notificar al técnico — no bloqueamos si falla
            await supabase.functions.invoke("send-notification", {
                body: {
                    user_id: form.worker_id,
                    title:   "Nuevo trabajo asignado",
                    body:    `Se te ha asignado el trabajo: "${form.title}"`,
                    data:    "jobs",
                },
            }).catch((notifError: unknown) => {
                console.warn("Notificación no enviada:", notifError);
            });

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1200);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error al crear el trabajo";
            setError(message);
        } finally {
            setSaving(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Dialog
            open={open}
            onClose={!saving ? onClose : undefined}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
        >
            {/* Header */}
            <Box sx={{ bgcolor: "#1A1A2E", px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#FFD600", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BuildIcon sx={{ fontSize: 17, color: "#1A1A2E" }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={800} color="#fff" fontSize={16} lineHeight={1.2}>
                            Nuevo Trabajo
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                            Desde cotización aceptada
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} disabled={saving} size="small" sx={{ color: "rgba(255,255,255,0.5)" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                {/* Badge origen */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, p: 1.5, bgcolor: "rgba(255,214,0,0.08)", borderRadius: 2.5, border: "1px solid rgba(255,214,0,0.2)" }}>
                    <Chip label="Cotización aceptada" size="small" sx={{ bgcolor: "rgba(255,214,0,0.2)", color: "#B8860B", fontWeight: 700, fontSize: 11 }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {cotizacion.servicio} · ${cotizacion.costo_estimado}
                    </Typography>
                </Box>

                {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} icon={<CheckIcon />}>¡Trabajo creado exitosamente!</Alert>}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <TextField
                        label="Título del trabajo" fullWidth size="small"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        InputProps={{ startAdornment: <BuildIcon sx={{ fontSize: 17, color: "#5A5A72", mr: 1 }} /> }}
                    />

                    <TextField
                        label="Dirección" fullWidth size="small"
                        value={form.address}
                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                        InputProps={{ startAdornment: <LocationOnIcon sx={{ fontSize: 17, color: "#5A5A72", mr: 1 }} /> }}
                    />

                    <TextField
                        label="Presupuesto ($)" fullWidth size="small" type="number"
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                        InputProps={{ startAdornment: <AttachMoneyIcon sx={{ fontSize: 17, color: "#2E7D32", mr: 1 }} /> }}
                    />

                    <TextField
                        label="Fecha y hora de la cita" fullWidth size="small"
                        type="datetime-local"
                        value={form.fecha_cita}
                        onChange={(e) => setForm((p) => ({ ...p, fecha_cita: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ startAdornment: <CalendarTodayIcon sx={{ fontSize: 16, color: "#1565C0", mr: 1 }} /> }}
                    />

                    <Divider />

                    {/* Selector técnico */}
                    <Box>
                        <Typography variant="body2" fontWeight={700} mb={1.5}>
                            Asignar técnico
                        </Typography>

                        {loadingTecnicos ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={24} sx={{ color: "#FFD600" }} />
                            </Box>
                        ) : (
                            <FormControl fullWidth size="small">
                                <InputLabel>Seleccionar técnico</InputLabel>
                                <Select
                                    value={form.worker_id}
                                    label="Seleccionar técnico"
                                    onChange={(e) => setForm((p) => ({ ...p, worker_id: e.target.value }))}
                                    renderValue={(selectedId) => {
                                        const t = tecnicos.find((t) => t.id === selectedId);
                                        if (!t) return "";
                                        return (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: "#FFD600", color: "#1A1A2E", fontWeight: 800 }}>
                                                    {t.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                                            </Box>
                                        );
                                    }}
                                >
                                    {tecnicos.map((t) => (
                                        <MenuItem key={t.id} value={t.id}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "#FFD600", color: "#1A1A2E", fontWeight: 800 }}>
                                                    {t.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{t.email}</Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Preview técnico seleccionado */}
                        {tecnicoSeleccionado && (
                            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "rgba(46,125,50,0.06)", borderRadius: 2, border: "1px solid rgba(46,125,50,0.2)", display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: "#FFD600", color: "#1A1A2E", fontWeight: 800 }}>
                                    {tecnicoSeleccionado.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={700}>{tecnicoSeleccionado.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {tecnicoSeleccionado.phone} · {tecnicoSeleccionado.email}
                                    </Typography>
                                </Box>
                                <Chip label={tecnicoSeleccionado.role} size="small"
                                      sx={{ ml: "auto", bgcolor: "rgba(255,214,0,0.15)", color: "#B8860B", fontWeight: 700, fontSize: 10 }} />
                            </Box>
                        )}
                    </Box>

                    <TextField
                        label="Descripción detallada" fullWidth multiline rows={3}
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                <Button onClick={onClose} disabled={saving}
                        sx={{ borderRadius: 2.5, fontWeight: 600, color: "text.secondary" }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleGuardar}
                    disabled={saving || success}
                    endIcon={
                        saving   ? <CircularProgress size={16} color="inherit" /> :
                            success  ? <CheckIcon /> :
                                <PersonIcon />
                    }
                    sx={{
                        borderRadius: 2.5, fontWeight: 800, px: 3,
                        bgcolor: saving || success ? "#2E7D32" : "#FFD600",
                        color:   saving || success ? "#fff"    : "#1A1A2E",
                        "&:hover":    { bgcolor: "#F9A800" },
                        "&:disabled": { bgcolor: saving || success ? "#2E7D32" : undefined, color: saving || success ? "#fff" : undefined },
                    }}
                >
                    {saving ? "Guardando..." : success ? "¡Creado!" : "Confirmar Trabajo"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}