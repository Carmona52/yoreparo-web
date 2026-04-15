"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WorkIcon from "@mui/icons-material/Work";

import {serviciosService, JobEstado} from "@/lib/data/servicios";
import {cotizacionesService} from "@/lib/data/cotizaciones";
import {tecnicosService} from "@/lib/data/tecnicos";

import {Cotizaciones} from "@/lib/types/cotizaciones";
import {User} from "@/lib/types/user";
import {Servicios} from "@/lib/types/servicios";

interface TecnicoEnCampo {
    tecnico: User;
    trabajoActivo: Servicios | null;
    gananciasSemanales: number;
    cotizacionesCanceladas: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");

    const [serviciosActivos, setServiciosActivos] = useState<number>(0);
    const [tecnicosDisponibles, setTecnicosDisponibles] = useState<number>(0);
    const [cotizacionesPendientes, setCotizacionesPendientes] = useState<number>(0);
    const [completados, setCompletados] = useState<number>(0);

    const [recentQuotes, setRecentQuotes] = useState<Cotizaciones[]>([]);
    const [tecnicosEnCampo, setTecnicosEnCampo] = useState<TecnicoEnCampo[]>([]);

    useEffect(() => {
        const checkUser = async () => {
            const {data: {user}} = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }
            const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Usuario";
            setUserName(firstName);
            await loadDashboardData();
        };
        checkUser();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [allJobs, allQuotes, allTechs] = await Promise.all([
                serviciosService.getAllServicios(),
                cotizacionesService.getAllCotizaciones(),
                tecnicosService.getTecnicos(),
            ]);

            const activos = allJobs.filter(job => job.status !== "finalizado").length;
            setServiciosActivos(activos);

            setTecnicosDisponibles(allTechs.length);

            const pendientes = allQuotes.filter(q => q.estado === "Pendiente").length;
            setCotizacionesPendientes(pendientes);

            const finalizados = allJobs.filter(job => job.status === "finalizado").length;
            setCompletados(finalizados);

            const sortedQuotes = [...allQuotes]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 6);
            setRecentQuotes(sortedQuotes);

            const techsWithActiveJob = await Promise.all(
                allTechs.map(async (tech) => {
                    const jobsOfTech = await tecnicosService.getJobsByTecnico(tech.id);
                    const activeJob = jobsOfTech.find(job => job.status === "en proceso") || null;

                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    const weeklyCompletedJobs = jobsOfTech.filter(job =>
                        job.status === "Finalizado" && new Date(job.created_at) >= oneWeekAgo
                    );
                    const gananciasSemanales = weeklyCompletedJobs.reduce((sum, job) => sum + (job.price || 0), 0);

                    const cotizacionesCanceladas = allQuotes.filter(q =>
                        q.created_by === tech.id && (q.estado === "Cancelada" || q.estado === "Rechazada")
                    ).length;

                    return {
                        tecnico: tech,
                        trabajoActivo: activeJob,
                        gananciasSemanales,
                        cotizacionesCanceladas,
                    };
                })
            );

            const techsWithActive = techsWithActiveJob.filter(t => t.trabajoActivo !== null);
            setTecnicosEnCampo(techsWithActive);
        } catch (err) {
            console.error("Error cargando dashboard:", err);
            setError("No se pudieron cargar los datos. Intenta de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", height: "70vh"}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{m: 2}}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Hola, {userName} 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Aquí está el resumen del día
                </Typography>
            </Box>

            <Grid container spacing={2.5} sx={{mb: 4}}>
                <Grid size={{xs: 12, sm: 6, xl: 3}}>
                    <Card sx={{cursor:'pointer'}} onClick={()=> router.push("dashboard/servicios") }>
                        <CardContent sx={{p: "20px !important"}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                <Box>
                                    <Typography variant="overline" display="block" mb={0.5}>
                                        Servicios activos
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="text.primary">
                                        {serviciosActivos}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2.5,
                                    bgcolor: "rgba(245,124,0,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <BuildIcon sx={{fontSize: 22, color: "#F57C00"}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 6, xl: 3}}>
                    <Card  sx={{cursor:'pointer'}} onClick={()=> router.push("dashboard/tecnicos") }>
                        <CardContent sx={{p: "20px !important"}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                <Box>
                                    <Typography variant="overline" display="block" mb={0.5}>
                                        Técnicos disponibles
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="text.primary">
                                        {tecnicosDisponibles}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2.5,
                                    bgcolor: "rgba(21,101,192,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <PeopleIcon sx={{fontSize: 22, color: "#1565C0"}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 6, xl: 3}}>
                    <Card  sx={{cursor:'pointer'}} onClick={()=> router.push("dashboard/cotizaciones") }>
                        <CardContent sx={{p: "20px !important"}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                <Box>
                                    <Typography variant="overline" display="block" mb={0.5}>
                                        Cotizaciones pendientes
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="text.primary">
                                        {cotizacionesPendientes}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2.5,
                                    bgcolor: "rgba(255,214,0,0.12)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <AssignmentIcon sx={{fontSize: 22, color: "#FFD600"}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 6, xl: 3}}>
                    <Card>
                        <CardContent sx={{p: "20px !important"}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                <Box>
                                    <Typography variant="overline" display="block" mb={0.5}>
                                        Completados
                                    </Typography>
                                    <Typography variant="h4" fontWeight={800} color="text.primary">
                                        {completados}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 2.5,
                                    bgcolor: "rgba(46,125,50,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <CheckCircleIcon sx={{fontSize: 22, color: "#2E7D32"}}/>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={2.5}>
                <Grid size={{xs: 12, md: 7}}>
                    <Card sx={{height: "100%"}}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Cotizaciones recientes
                            </Typography>
                            {recentQuotes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No hay cotizaciones recientes.
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {recentQuotes.map((quote, idx) => (
                                        <Box key={quote.id}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => {
                                                        console.log("Ver cotización:", quote.id);
                                                        router.push(`dashboard/cotizaciones/${quote.id}`)
                                                    }}>
                                                    <ListItemText
                                                        primary={
                                                            <Box
                                                                sx={{display: "flex", justifyContent: "space-between"}}>
                                                                <Typography variant="body1" fontWeight={500}>
                                                                    {quote.servicio}
                                                                </Typography>
                                                                <Chip
                                                                    label={quote.estado}
                                                                    size="small"
                                                                    color={quote.estado === "Pendiente" ? "warning" : quote.estado === "Enviada" ? "info" : "default"}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={`${new Date(quote.created_at).toLocaleDateString()} - $${quote.costo_estimado || "N/A"}`}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            {idx < recentQuotes.length - 1 && <Divider/>}
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, md: 5}}>
                    <Card sx={{height: "100%"}}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Técnicos en campo
                            </Typography>
                            {tecnicosEnCampo.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No hay técnicos con trabajos en proceso.
                                </Typography>
                            ) : (
                                <List disablePadding>
                                    {tecnicosEnCampo.map((item, idx) => (
                                        <Box key={item.tecnico.id}>
                                            <ListItem alignItems="flex-start" sx={{px: 0}}>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1,
                                                            mb: 0.5
                                                        }}>
                                                            <Avatar sx={{width: 28, height: 28, bgcolor: "#1565C0"}}>
                                                                {item.tecnico.name?.charAt(0) || "T"}
                                                            </Avatar>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {item.tecnico.name}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box component="span" sx={{mt: 1, display: "block"}}>
                                                            <Box sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 1,
                                                                mb: 0.5
                                                            }}>
                                                                <WorkIcon fontSize="small" color="action"/>
                                                                <Typography variant="body2" color="text.primary">
                                                                    <strong>Trabajo
                                                                        activo:</strong> {item.trabajoActivo?.title || "Ninguno"}
                                                                </Typography>
                                                            </Box>

                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {idx < tecnicosEnCampo.length - 1 && <Divider sx={{my: 1}}/>}
                                        </Box>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}