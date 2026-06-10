'use client'

import {serviciosService} from "@/lib/data/servicios";
import {Servicios} from "@/lib/types/servicios";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ImageIcon from "@mui/icons-material/Image";
import NewJobModalNoData from "@/components/jobs/newJobModalNoData";
import SearchIcon from '@mui/icons-material/Search';
import {TextField, Tabs, Tab, FormControl, Select, MenuItem} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import PersonIcon from "@mui/icons-material/Person";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    pendiente: {bg: "rgba(245,124,0,0.12)", color: "#E65100", label: "Pendiente"},
    "en proceso": {bg: "rgba(21,101,192,0.12)", color: "#1565C0", label: "En proceso"},
    finalizado: {bg: "rgba(46,125,50,0.12)", color: "#2E7D32", label: "Finalizado"},
    cancelado: {bg: "rgba(211,47,47,0.12)", color: "#C62828", label: "Cancelado"},
};

function StatusChip({status}: { status: string }) {
    const style = STATUS_STYLES[status?.toLowerCase()] ?? {
        bg: "rgba(0,0,0,0.07)", color: "#5A5A72", label: status ?? "—",
    };
    return (
        <Chip
            label={style.label}
            size="small"
            sx={{bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: 11, height: 22}}
        />
    );
}

function formatFecha(fecha: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

export default function ServiciosPage() {
    const router = useRouter();
    const [servicios, setServicios] = useState<Servicios[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [sortOrder, setSortOrder] = useState<"prioridad" | "desc" | "asc">("desc");

    useEffect(() => {
        serviciosService.getAllServicios()
            .then(setServicios)
            .catch(() => setError("No se pudieron cargar los servicios"))
            .finally(() => setLoading(false));
    }, []);

    const filteredAndSortedServicios = useMemo(() => {
        const PRIORITY_MAP: Record<string, number> = {
            'en proceso': 1,
            'pendiente': 2,
            'finalizado': 3,
            'cancelado': 4
        };

        const filtered = servicios.filter(s => {
            const search = searchQuery.toLowerCase();
            const matchesSearch = (
                s.title?.toLowerCase().includes(search) ||
                s.description?.toLowerCase().includes(search) ||
                s.address?.toLowerCase().includes(search)
            );

            const matchesStatus = statusFilter === "todos" || s.status?.toLowerCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });

        return [...filtered].sort((a, b) => {
            if (sortOrder === "prioridad") {
                const prioA = PRIORITY_MAP[a.status?.toLowerCase()] ?? 99;
                const prioB = PRIORITY_MAP[b.status?.toLowerCase()] ?? 99;
                return prioA - prioB;
            } else {
                const dateA = new Date(a.fecha_cita || 0).getTime();
                const dateB = new Date(b.fecha_cita || 0).getTime();
                return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
            }
        });
    }, [servicios, searchQuery, statusFilter, sortOrder]);

    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    if (error) return <Alert severity="error" sx={{mt: 2}}>{error}</Alert>;

    return (
        <Box>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 800,
                    mb: 1
                }}>Servicios</Typography>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    mb: 4
                }}>
                {servicios.length} servicio{servicios.length !== 1 ? "s" : ""} registrados
            </Typography>

            <Box sx={{
                my: 3,
                display: "flex",
                flexDirection: {xs: 'column', md: 'row'},
                justifyContent: "space-between",
                gap: 2
            }}>
                <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                        placeholder="Buscar por título, dirección..."
                        size='small'
                        value={searchQuery}
                        onChange={event => setSearchQuery(event.target.value)}
                        sx={{ flexGrow: 1 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                        <Select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as "prioridad" | "desc" | "asc")}
                            displayEmpty
                        >
                            <MenuItem value="desc">Más recientes</MenuItem>
                            <MenuItem value="asc">Más antiguos</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <NewJobModalNoData/>
            </Box>

            {/* Selector de Estados (Tabs) */}
            <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
                <Tabs
                    value={statusFilter}
                    onChange={(_, newValue) => setStatusFilter(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        '& .MuiTab-root': {fontWeight: 700, fontSize: 13, textTransform: 'none', minWidth: 100}
                    }}
                >
                    <Tab label="Todos" value="todos"/>
                    <Tab label="En proceso" value="en proceso"/>
                    <Tab label="Pendientes" value="pendiente"/>
                    <Tab label="Finalizados" value="finalizado"/>
                    <Tab label="Cancelados" value="cancelado"/>
                </Tabs>
            </Box>

            {filteredAndSortedServicios.length === 0 ? (
                <Alert severity="info" sx={{borderRadius: 3}}>
                    {searchQuery || statusFilter !== "todos"
                        ? "No se encontraron servicios con los filtros aplicados."
                        : "No hay servicios registrados."}
                </Alert>
            ) : (
                <Grid container spacing={2.5}>
                    {filteredAndSortedServicios.map((s) => (
                        <Grid key={s.id} size={{xs: 12, md: 6, xl: 4}}>
                            <Card sx={{height: "100%", borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                                <CardActionArea onClick={() => router.push(`/dashboard/servicios/${s.id}`)}
                                                sx={{height: "100%"}}>

                                    {s.image_url ? (
                                        <Box component="img" src={s.image_url} alt={s.title}
                                             sx={{width: "100%", height: 160, objectFit: "cover"}}/>
                                    ) : (
                                        <Box sx={{
                                            width: "100%",
                                            height: 100,
                                            bgcolor: "rgba(255,214,0,0.08)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <ImageIcon sx={{fontSize: 36, color: "rgba(255,214,0,0.4)"}}/>
                                        </Box>
                                    )}

                                    <CardContent sx={{p: 3}}>
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            mb: 1
                                        }}>
                                            <Typography
                                                noWrap
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: 15,
                                                    flex: 1,
                                                    pr: 1
                                                }}>
                                                {s.title ?? "Sin título"}
                                            </Typography>
                                            <StatusChip status={s.status}/>
                                        </Box>

                                        {s.description && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "text.secondary",
                                                    mb: 2,
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden"
                                                }}>
                                                {s.description}
                                            </Typography>
                                        )}

                                        <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
                                            <PersonIcon sx={{fontSize: 18, color: "#5A5A72"}}/>
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "text.primary"
                                                }}>
                                                {s.name_client && s.name_client.length > 0 ? s.name_client : s.profiles?.name || "Sin cliente"}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{my: 2}}/>

                                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                                <AttachMoneyIcon sx={{fontSize: 15, color: "#2E7D32"}}/>
                                                <Typography variant="body2" sx={{
                                                    color: "text.secondary"
                                                }}>
                                                    Precio: <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: "text.primary"
                                                    }}>{s.price ? `$${s.price.toLocaleString("es-MX")}` : "—"}</Typography>
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                                <LocationOnIcon sx={{fontSize: 15, color: "#F57C00"}}/>
                                                <Typography variant="body2" noWrap sx={{
                                                    color: "text.secondary"
                                                }}>{s.address ?? "—"}</Typography>
                                            </Box>
                                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                                <CalendarTodayIcon sx={{fontSize: 15, color: "#1565C0"}}/>
                                                <Typography variant="body2" sx={{
                                                    color: "text.secondary"
                                                }}>Cita: {formatFecha(s.fecha_cita)}</Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{my: 2}}/>

                                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <PersonIcon sx={{fontSize: 15, color: "#1565C0"}}/>
                                            <Typography variant="body2" sx={{
                                                color: "text.secondary"
                                            }}>
                                                Trabajador: <Typography
                                                component="span"
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "text.primary"
                                                }}>{s.trabajador?.name || "No asignado"}</Typography>
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}