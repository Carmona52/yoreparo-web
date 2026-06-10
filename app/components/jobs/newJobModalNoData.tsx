'use client';

import {useState, useEffect, useCallback} from 'react';
import {createClient} from '@/lib/supabase/client';
import {User} from '@/lib/types/user';
import {jobWorkersService} from '@/lib/data/jobWorkers';
import SelectorTecnicosAdicionales from "@/components/jobs/selectTecnicosAdicionales";

import {
    Dialog, DialogContent, DialogActions,
    Box, Typography, TextField, Button, IconButton,
    Avatar, CircularProgress, Alert, Divider,
    MenuItem, Select, InputLabel, FormControl, Chip, Autocomplete,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CheckIcon from '@mui/icons-material/Check';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';

type FormState = {
    title: string; description: string; address: string;
    worker_id: string; name_client: string; price: string;
};

type DatePickerState = { date: string; time: string };

function buildInitialDate(): DatePickerState {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        time: `${pad(now.getHours())}:00`,
    };
}

function buildInitialForm(): FormState {
    return {title: '', description: '', address: '', worker_id: '', name_client: '', price: ''};
}

function toLocalISOFromParts(dateStr: string, timeStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const localDate = new Date(year, month - 1, day, hours, minutes);
    const offset = -localDate.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:00${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
}

const timeSlots = Array.from({length: 13}, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);

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
    const [adicionales, setAdicionales] = useState<string[]>([]);

    const handleClose = useCallback(() => {
        if (!saving) {
            setOpen(false);
            setTimeout(() => {
                setForm(buildInitialForm());
                setDateTime(buildInitialDate());
                setAdicionales([]);
                setSuccess(false);
                setError(null);
            }, 300);
        }
    }, [saving]);

    useEffect(() => {
        if (!open) return;

        async function cargarTecnicos() {
            setLoadingTecnicos(true);
            try {
                const {data, error: sbError} = await supabase.from('profiles').select('*').neq('role', 'cliente');
                if (!sbError && data) setTecnicos(data as User[]);
            } finally {
                setLoadingTecnicos(false);
            }
        }

        void cargarTecnicos();
    }, [open]);

    const tecnicoLider = tecnicos.find((t) => t.id === form.worker_id);

    const handleGuardar = async () => {
        if (!form.title.trim()) return setError('El título es requerido');
        if (!form.address.trim()) return setError('La dirección es requerida');
        if (!form.name_client.trim()) return setError('Se requiere un nombre de cliente');
        if (!form.worker_id) return setError('Selecciona el líder de equipo');
        if (!dateTime.date || !dateTime.time) return setError('Fecha y hora son requeridas');

        const selectedDate = new Date(`${dateTime.date}T${dateTime.time}`);
        if (isNaN(selectedDate.getTime())) return setError('Fecha inválida');
        if (selectedDate < new Date()) return setError('No se puede crear un trabajo en el pasado');
        if (adicionales.includes(form.worker_id)) return setError('El líder no puede estar como técnico adicional');

        setSaving(true);
        setError(null);

        try {
            const {data: {user}} = await supabase.auth.getUser();
            if (!user) throw new Error('Sin sesión activa');

            const {data: newJob, error: insertError} = await supabase
                .from('jobs')
                .insert({
                    title: form.title,
                    description: form.description,
                    address: form.address,
                    worker_id: form.worker_id,
                    fecha_cita: toLocalISOFromParts(dateTime.date, dateTime.time),
                    created_by: user.id,
                    status: 'Pendiente',
                    price: parseFloat(form.price) || 0,
                    name_client: form.name_client,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Técnicos adicionales
            if (adicionales.length > 0) {
                await jobWorkersService.insertMany(newJob.id, adicionales);
            }

            // Notificar líder
            await supabase.functions.invoke('send-notification', {
                body: {
                    user_id: form.worker_id,
                    title: 'Nuevo trabajo asignado',
                    body: `Se te ha asignado como líder del trabajo: "${form.title}"`,
                    data: 'jobs',
                },
            });

            // Notificar adicionales
            if (adicionales.length > 0) {
                await jobWorkersService.notificarTodos(newJob.id, form.title,
                    `Has sido asignado al equipo del trabajo: "${form.title}"`
                );
            }

            setSuccess(true);
            setTimeout(handleClose, 1200);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al crear el trabajo');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon/>} onClick={() => setOpen(true)}>
                Nuevo Trabajo
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{
                paper: {
                    sx: {borderRadius: 4, overflow: 'hidden'}
                }
            }}>

                <Box sx={{
                    bgcolor: '#1A1A2E',
                    px: 3,
                    py: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#FFD600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <BuildIcon sx={{fontSize: 17, color: '#1A1A2E'}}/>
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    color: "#fff",
                                    fontSize: 16,
                                    lineHeight: 1.2
                                }}>Nuevo
                                Trabajo</Typography>
                            <Typography variant="caption" sx={{
                                color: "rgba(255,255,255,0.5)"
                            }}>Creación manual</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClose} disabled={saving} size="small"
                                sx={{color: 'rgba(255,255,255,0.5)'}}>
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Box>

                <DialogContent sx={{p: 3}}>
                    {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{mb: 2}} icon={<CheckIcon/>}>¡Trabajo creado
                        exitosamente!</Alert>}

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
                        <TextField label="Título del trabajo" fullWidth size="small" value={form.title}
                                   onChange={(e) => setForm(p => ({...p, title: e.target.value}))}
                                   slotProps={{
                                       input: {
                                           startAdornment: <BuildIcon sx={{fontSize: 17, color: '#5A5A72', mr: 1}}/>
                                       }
                                   }}/>

                        <TextField label="Dirección" fullWidth size="small" value={form.address}
                                   onChange={(e) => setForm(p => ({...p, address: e.target.value}))}
                                   slotProps={{
                                       input: {
                                           startAdornment: <LocationOnIcon
                                               sx={{fontSize: 17, color: '#5A5A72', mr: 1}}/>
                                       }
                                   }}/>

                        <TextField label="Nombre del Cliente" fullWidth size="small" value={form.name_client}
                                   onChange={(e) => setForm(p => ({...p, name_client: e.target.value}))}
                                   slotProps={{
                                       input: {
                                           startAdornment: <PersonIcon sx={{fontSize: 17, color: '#5A5A72', mr: 1}}/>
                                       }
                                   }}/>

                        <TextField label="Presupuesto ($)" fullWidth size="small" type="number" value={form.price}
                                   onChange={(e) => setForm(p => ({...p, price: e.target.value}))}
                                   slotProps={{
                                       input: {
                                           startAdornment: <AttachMoneyIcon
                                               sx={{fontSize: 17, color: '#2E7D32', mr: 1}}/>
                                       }
                                   }}/>

                        <Box sx={{display: 'flex', gap: 2}}>
                            <TextField label="Fecha" type="date" size="small" value={dateTime.date}
                                       onChange={(e) => setDateTime(p => ({...p, date: e.target.value}))}
                                       slotProps={{
                                           inputLabel: {shrink: true},
                                           input: {
                                               startAdornment: <CalendarTodayIcon
                                                   sx={{fontSize: 16, color: '#1565C0', mr: 1}}/>
                                           }
                                       }}
                                       sx={{flex: 1}}/>
                            <FormControl size="small" sx={{flex: 1}}>
                                <InputLabel>Hora</InputLabel>
                                <Select value={dateTime.time} label="Hora"
                                        onChange={(e) => setDateTime(p => ({...p, time: e.target.value}))}>
                                    {timeSlots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>

                        <Divider/>

                        {/* Líder */}
                        <Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.5}}>
                                <StarIcon sx={{fontSize: 17, color: '#B8860B'}}/>
                                <Typography variant="body2" sx={{
                                    fontWeight: 700
                                }}>Líder de equipo</Typography>
                            </Box>

                            {loadingTecnicos ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', py: 2}}>
                                    <CircularProgress size={24} sx={{color: '#FFD600'}}/>
                                </Box>
                            ) : (
                                <Autocomplete
                                    options={tecnicos}
                                    getOptionLabel={(o) => o.name || ''}
                                    value={tecnicoLider || null}
                                    onChange={(_, v) => setForm(p => ({...p, worker_id: v ? v.id : ''}))}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Seleccionar líder" size="small"
                                                   placeholder="Escribe para buscar..."/>
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}
                                             sx={{display: 'flex', alignItems: 'center', gap: 1.5, p: 1}}>
                                            <Avatar sx={{
                                                width: 30,
                                                height: 30,
                                                fontSize: 12,
                                                bgcolor: '#FFD600',
                                                color: '#1A1A2E',
                                                fontWeight: 800
                                            }}>
                                                {option.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{
                                                    fontWeight: 600
                                                }}>{option.name}</Typography>
                                                <Typography variant="caption"
                                                            sx={{
                                                                color: "text.secondary"
                                                            }}>{option.email}</Typography>
                                            </Box>
                                        </Box>
                                    )}
                                    noOptionsText="No se encontraron resultados"
                                />
                            )}

                            {tecnicoLider && (
                                <Box sx={{
                                    mt: 1.5,
                                    p: 1.5,
                                    bgcolor: 'rgba(255,214,0,0.06)',
                                    borderRadius: 2,
                                    border: '1px solid rgba(255,214,0,0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}>
                                    <Avatar sx={{
                                        width: 34,
                                        height: 34,
                                        bgcolor: '#FFD600',
                                        color: '#1A1A2E',
                                        fontWeight: 800
                                    }}>
                                        {tecnicoLider.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2" sx={{
                                            fontWeight: 700
                                        }}>{tecnicoLider.name}</Typography>
                                        <Typography variant="caption"
                                                    sx={{
                                                        color: "text.secondary"
                                                    }}>{tecnicoLider.phone || 'Sin teléfono'} · {tecnicoLider.email}</Typography>
                                    </Box>
                                    <Chip label="Líder" size="small"
                                          icon={<StarIcon sx={{fontSize: 12, color: '#B8860B !important'}}/>}
                                          sx={{
                                              bgcolor: 'rgba(255,214,0,0.2)',
                                              color: '#B8860B',
                                              fontWeight: 700,
                                              fontSize: 10
                                          }}/>
                                </Box>
                            )}
                        </Box>

                        {/* Adicionales */}
                        <SelectorTecnicosAdicionales
                            tecnicos={tecnicos}
                            seleccionados={adicionales}
                            onChange={setAdicionales}
                            liderID={form.worker_id}
                            disabled={loadingTecnicos}
                        />

                        <TextField label="Descripción detallada" fullWidth multiline rows={3} value={form.description}
                                   onChange={(e) => setForm(p => ({...p, description: e.target.value}))}/>
                    </Box>
                </DialogContent>

                <DialogActions sx={{px: 3, pb: 3, pt: 0, gap: 1}}>
                    <Button onClick={handleClose} disabled={saving} color='error'
                            sx={{borderRadius: 2.5, fontWeight: 600,}}>Cancelar</Button>
                    <Button variant="contained" onClick={handleGuardar} disabled={saving || success}
                            endIcon={saving ? <CircularProgress size={16} color="inherit"/> : success ? <CheckIcon/> :
                                <PersonIcon/>}>
                        {saving ? 'Guardando...' : success ? '¡Creado!' : 'Confirmar Trabajo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}