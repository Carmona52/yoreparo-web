'use client'
import Typography from "@mui/material/Typography";
import HerramientasCard from "@/components/herramientas/cardHerramineta";
import {useEffect, useMemo, useState} from "react";
import {Herramienta} from "@/lib/types/herramienta";
import {herramientasService} from "@/lib/data/herramientas";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {InputAdornment, TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RegistrarNuevaHerramienta from "@/components/herramientas/registrarNuevaHerramienta";

export default function HerramientasPage() {
    const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    console.log(herramientas);
    useEffect(() => {
        herramientasService.getAllHerramientas()
            .then(setHerramientas)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [])

    const filterHerramientas = useMemo(() => {
        return herramientas.filter(t => {
            const search = searchQuery.toLowerCase();
            return (
                t.tool?.toLowerCase().includes(search)
            );
        });
    }, [herramientas, searchQuery]);

    if (loading) return (
        <Box sx={{display: "flex", justifyContent: "center", mt: 8}}>
            <CircularProgress sx={{color: "#FFD600"}}/>
        </Box>
    );

    return (
        <Box>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 800,
                    mb: 1
                }}>Herramientas de Yo Reparo</Typography>
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                    mb: 4
                }}>
                {herramientas.length} Herramienta{herramientas.length !== 1 ? "s" : ""} Registradas
            </Typography>
            <Box sx={{mb: 3, display: "flex", justifyContent: "space-between"}}>
                <TextField
                    placeholder="Buscar por nombre, o persona prestada"
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

                <RegistrarNuevaHerramienta></RegistrarNuevaHerramienta>
            </Box>
            {filterHerramientas.map((herramienta, key) => (
                <HerramientasCard key={key} id={herramienta.id} created_at={herramienta.created_at}
                                  tool={herramienta.tool}
                                  estado={herramienta.estado}
                                  worker_id={herramienta.worker_id}
                                  trabajador={herramienta.trabajador}
                                  fecha_prestamo={herramienta.fecha_prestamo}/>
            ))}
        </Box>
    );
}