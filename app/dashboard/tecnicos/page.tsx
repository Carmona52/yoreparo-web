'use client'

import {tecnicosService} from "@/lib/data/tecnicos";
import {User} from "@/lib/types/user";
import {useEffect, useMemo, useState} from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import {TextField, InputAdornment} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import NewWorkerModal from "@/components/tecnicos/NewWorkerModal";
import TechnicianCard from "@/components/tecnicos/TechnicCard";

export default function TecnicosPage() {
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        tecnicosService.getTecnicos()
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
            <Typography variant="h4" sx={{fontWeight: 800, mb: 1}}>
                Técnicos
            </Typography>
            <Typography variant="body2" sx={{color: "text.secondary", mb: 4}}>
                {tecnicos.length} técnico{tecnicos.length !== 1 ? "s" : ""} registrados
            </Typography>
            <Box sx={{mb: 3, display: "flex", justifyContent: "space-between"}}>
                <TextField placeholder="Buscar por nombre, correo o rol..." size='small' value={searchQuery} onChange={event => setSearchQuery(event.target.value)} sx={{width: {xs: '100%', sm: 400}}}
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
            ) : filteredTecnicos.length === 0 ? (
                <Alert severity="warning">No se encontraron técnicos que coincidan con tu búsqueda.</Alert>
            ) : (
                <Grid container spacing={2.5}>
                    {filteredTecnicos.map((tecnico) => (
                        <Grid key={tecnico.id} size={{xs: 12, sm: 6, lg: 4}}>
                            <TechnicianCard tecnico={tecnico}/>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}