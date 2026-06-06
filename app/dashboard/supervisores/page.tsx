'use client'

import {tecnicosService} from "@/lib/data/tecnicos";
import {User} from "@/lib/types/user";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import Grid from "@mui/material/Grid";
import NewWorkerModal from "@/components/tecnicos/NewWorkerModal";
import {InputAdornment, TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";


export default function TecnicosPage() {
    const router = useRouter();
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        tecnicosService.getSupervisores()
            .then(setTecnicos)
            .catch(() => setError("No se pudieron cargar los técnicos"))
            .finally(() => setLoading(false));
    }, []);

    const filteredTecnicos = useMemo(() => {
        return tecnicos.filter(t => {
            const search = searchQuery.toLowerCase();
            return (
                t.name?.toLowerCase().includes(search) ||
                t.email?.toLowerCase().includes(search) ||
                t.role?.toLowerCase().includes(search)
            );
        });
    }, [tecnicos, searchQuery]);


    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    if (error) return (
        <Alert severity="error" sx={{mt: 2}}>{error}</Alert>
    );

    return (
        <Box>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 800,
                    mb: 1
                }}>Supervisores y Trabajadores con mayor rango</Typography>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    mb: 4
                }}>
                {tecnicos.length} Supervisore{tecnicos.length !== 1 ? "s" : ""} registrados
            </Typography>
            <Box sx={{mb: 3, display: "flex", justifyContent: "space-between"}}>
                <TextField
                    placeholder="Buscar por nombre, correo o rol..."
                    size='small'
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    sx={{width: {xs: '100%', sm: 400}}}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small"/>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
                <NewWorkerModal/>
            </Box>
            {tecnicos.length === 0 ? (
                <Alert severity="info">No hay técnicos registrados</Alert>
            ) : (
                <Grid container spacing={2.5}>
                    {filteredTecnicos.map((tecnico) => (
                        <Grid key={tecnico.id} size={{xs: 12, sm: 6, lg: 4}}>
                            <Card>
                                <CardActionArea onClick={() => router.push(`/dashboard/supervisores/${tecnico.id}`)}>
                                    <CardContent sx={{p: 3}}>
                                        <Box sx={{display: "flex", alignItems: "center", gap: 2, mb: 2}}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: "#FFD600",
                                                    color: "#1A1A2E",
                                                    fontWeight: 800,
                                                    width: 46,
                                                    height: 46,
                                                }}
                                            >
                                                {tecnico.name?.charAt(0).toUpperCase() ?? "T"}
                                            </Avatar>
                                            <Box sx={{flex: 1, minWidth: 0}}>
                                                <Typography noWrap sx={{
                                                    fontWeight: 700
                                                }}>
                                                    {tecnico.name ?? "Sin nombre"}
                                                </Typography>
                                                <Chip
                                                    label={tecnico.role}
                                                    size="small"
                                                    sx={{
                                                        mt: 0.5,
                                                        height: 20,
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        bgcolor: "rgba(255,214,0,0.15)",
                                                        color: "#B8860B",
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box sx={{display: "flex", flexDirection: "column", gap: 0.8}}>
                                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                                <EmailIcon sx={{fontSize: 14, color: "text.secondary"}}/>
                                                <Typography variant="body2" noWrap sx={{
                                                    color: "text.secondary"
                                                }}>
                                                    {tecnico.email ?? "—"}
                                                </Typography>
                                            </Box>
                                            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                                <PhoneIcon sx={{fontSize: 14, color: "text.secondary"}}/>
                                                <Typography variant="body2" sx={{
                                                    color: "text.secondary"
                                                }}>
                                                    {tecnico.phone ?? "—"}
                                                </Typography>
                                            </Box>
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