'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/lib/types/user';

import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Avatar,
    CircularProgress,
    Alert,
    Divider,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Chip,
    Autocomplete
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';

type FormState = {
    title: string;
    description: string;
    address: string;
    worker_id: string;
    name_client: string;
    price: string;
};

// Estado local para fecha y hora por separado (evita efectos secundarios)
type DatePickerState = {
    date: string;   // YYYY-MM-DD
    time: string;   // HH:00
};

function buildInitialDate(): DatePickerState {
    const now = new Date();
    // Ajuste a la zona horaria local para el input type="date"
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:00`,
    };
}

function buildInitialForm(): Omit<FormState, 'price'> & { price: string } {
    return {
        title: '',
        description: '',
        address: '',
        worker_id: '',
        name_client: '',
        price: '',
    };
}

// Convierte fecha y hora local a ISO string con offset (para guardar en DB)
function toLocalISOFromParts(dateStr: string, timeStr: string): string {
    // Ejemplo: "2025-05-13" + "14:00" -> Date en zona local
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes);
    const offset = -localDate.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMins = pad(Math.abs(offset) % 60);
    return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:00${sign}${offsetHours}:${offsetMins}`;
}

export default function NewJobModalNoData() {
    const supabase = createClient();

    const [open, setOpen] = useState(false);
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    const [loadingTecnicos, setLoadingTecnicos] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState<FormState>(buildInitialForm);
    const [dateTime, setDateTime] = useState<DatePickerState>(buildInitialDate);

    const timeSlots = Array.from({ length: 13 }, (_, i) => {
        const hour = 8 + i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    const handleOpen = () => setOpen(true);

    const handleClose = useCallback(() => {
        if (!saving) {
            setOpen(false);
            // Reiniciar estado después de cerrar la animación
            setTimeout(() => {
                setForm(buildInitialForm());
                setDateTime(buildInitialDate());
                setSuccess(false);
                setError(null);
            }, 300);
        }
    }, [saving]);

    // Cargar técnicos cuando se abre el modal
    useEffect(() => {
        if (!open) return;

        async function cargarTecnicos() {
            setLoadingTecnicos(true);
            try {
                const { data, error: sbError } = await supabase
                    .from('profiles')
                    .select('*')
                    .neq('role', 'cliente');
                if (!sbError && data) setTecnicos(data as User[]);
            } finally {
                setLoadingTecnicos(false);
            }
        }
        cargarTecnicos();
    }, [open, supabase]);

    const tecnicoSeleccionado = tecnicos.find((t) => t.id === form.worker_id);

    const handleGuardar = async () => {
        // Validaciones
        if (!form.title.trim()) return setError('El título es requerido');
        if (!form.address.trim()) return setError('La dirección es requerida');
        if (!form.name_client.trim()) return setError('Se requiere un nombre de un cliente');
        if (!form.worker_id) return setError('Selecciona un técnico');
        if (!dateTime.date || !dateTime.time) return setError('Fecha y hora son requeridas');

        // Validar que la fecha no sea pasada (opcional)
        const selectedDate = new Date(`${dateTime.date}T${dateTime.time}`);
        if (isNaN(selectedDate.getTime())) return setError('Fecha inválida');
        if (selectedDate < new Date()) return setError('No se puede crear un trabajo en el pasado');

        setSaving(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Sin sesión activa');

            const fechaCitaISO = toLocalISOFromParts(dateTime.date, dateTime.time);

            const { error: insertError } = await supabase
                .from('jobs')
                .insert({
                    title: form.title,
                    description: form.description,
                    address: form.address,
                    worker_id: form.worker_id,
                    fecha_cita: fechaCitaISO,
                    created_by: user.id,
                    status: 'Pendiente',
                    price: parseFloat(form.price) || 0,
                    name_client: form.name_client,
                });

            if (insertError) throw insertError;

            await supabase.functions.invoke('send-notification', {
                body: {
                    user_id: form.worker_id,
                    title: 'Nuevo trabajo asignado',
                    body: `Se te ha asignado el trabajo: "${form.title}"`,
                    data: 'jobs',
                },
            })

            setSuccess(true);
            setTimeout(() => {
                handleClose();
                window.location.reload();
            }, 1200);
        } catch (err) {
            setError('Error al crear el trabajo');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                onClick={handleOpen}
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#FFD600', color: '#1A1A2E', fontWeight: 800, '&:hover': { bgcolor: '#F9A800' } }}
            >
                Nuevo Trabajo
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
            >
                <Box sx={{ bgcolor: '#1A1A2E', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#FFD600', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BuildIcon sx={{ fontSize: 17, color: '#1A1A2E' }} />
                        </Box>
                        <Box>
                            <Typography fontWeight={800} color="#fff" fontSize={16} lineHeight={1.2}>Nuevo Trabajo</Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.5)">Creación manual</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClose} disabled={saving} size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 3 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }} icon={<CheckIcon />}>¡Trabajo creado exitosamente!</Alert>}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Título del trabajo"
                            fullWidth
                            size="small"
                            value={form.title}
                            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                            InputProps={{ startAdornment: <BuildIcon sx={{ fontSize: 17, color: '#5A5A72', mr: 1 }} /> }}
                        />

                        <TextField
                            label="Dirección"
                            fullWidth
                            size="small"
                            value={form.address}
                            onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                            InputProps={{ startAdornment: <LocationOnIcon sx={{ fontSize: 17, color: '#5A5A72', mr: 1 }} /> }}
                        />

                        <TextField
                            label="Nombre del Cliente"
                            fullWidth
                            size="small"
                            value={form.name_client}
                            onChange={(e) => setForm(p => ({ ...p, name_client: e.target.value }))}
                            InputProps={{ startAdornment: <PersonIcon sx={{ fontSize: 17, color: '#5A5A72', mr: 1 }} /> }}
                        />

                        <TextField
                            label="Presupuesto ($)"
                            fullWidth
                            size="small"
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                            InputProps={{ startAdornment: <AttachMoneyIcon sx={{ fontSize: 17, color: '#2E7D32', mr: 1 }} /> }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Fecha"
                                type="date"
                                size="small"
                                value={dateTime.date}
                                onChange={(e) => setDateTime(prev => ({ ...prev, date: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{ startAdornment: <CalendarTodayIcon sx={{ fontSize: 16, color: '#1565C0', mr: 1 }} /> }}
                                sx={{ flex: 1 }}
                            />
                            <FormControl size="small" sx={{ flex: 1 }}>
                                <InputLabel>Hora</InputLabel>
                                <Select
                                    value={dateTime.time}
                                    label="Hora"
                                    onChange={(e) => setDateTime(prev => ({ ...prev, time: e.target.value as string }))}
                                >
                                    {timeSlots.map((slot) => (
                                        <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="body2" fontWeight={700} mb={1.5}>Asignar técnico</Typography>

                            {loadingTecnicos ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} sx={{ color: '#FFD600' }} />
                                </Box>
                            ) : (
                                <Autocomplete
                                    options={tecnicos}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={tecnicoSeleccionado || null}
                                    onChange={(_, newValue) => {
                                        setForm(p => ({ ...p, worker_id: newValue ? newValue.id : '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Seleccionar técnico" size="small" placeholder="Escribe para buscar..." />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
                                            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: '#FFD600', color: '#1A1A2E', fontWeight: 800 }}>
                                                {option.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{option.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    noOptionsText="No se encontraron resultados"
                                />
                            )}

                            {tecnicoSeleccionado && (
                                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(46,125,50,0.06)', borderRadius: 2, border: '1px solid rgba(46,125,50,0.2)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFD600', color: '#1A1A2E', fontWeight: 800 }}>
                                        {tecnicoSeleccionado.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700}>{tecnicoSeleccionado.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {tecnicoSeleccionado.phone || 'Sin teléfono'} · {tecnicoSeleccionado.email}
                                        </Typography>
                                    </Box>
                                    <Chip label={tecnicoSeleccionado.role} size="small" sx={{ ml: 'auto', bgcolor: 'rgba(255,214,0,0.15)', color: '#B8860B', fontWeight: 700, fontSize: 10 }} />
                                </Box>
                            )}
                        </Box>

                        <TextField
                            label="Descripción detallada"
                            fullWidth
                            multiline
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
                    <Button onClick={handleClose} disabled={saving} sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary' }}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleGuardar}
                        disabled={saving || success}
                        endIcon={saving ? <CircularProgress size={16} color="inherit" /> : success ? <CheckIcon /> : <PersonIcon />}
                        sx={{
                            borderRadius: 2.5,
                            fontWeight: 800,
                            px: 3,
                            bgcolor: success ? '#2E7D32' : '#FFD600',
                            color: success ? '#fff' : '#1A1A2E',
                            '&:hover': { bgcolor: '#F9A800' }
                        }}
                    >
                        {saving ? 'Guardando...' : success ? '¡Creado!' : 'Confirmar Trabajo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}