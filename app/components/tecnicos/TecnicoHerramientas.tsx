"use client";

import {useState} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import HandymanIcon from "@mui/icons-material/Handyman";
import HerramientaRow from "./HerramientaRow";
import ModalNuevaHerramienta from "./ModalNuevaHerramienta";
import {Herramienta, HerramientaEstado} from "@/lib/types/herramienta";

const ESTILOS: Record<HerramientaEstado, { color: string; bg: string }> = {
    Prestada: {color: "#1565C0", bg: "rgba(21,101,192,0.10)"},
    Dañada: {color: "#E65100", bg: "rgba(245,124,0,0.10)"},
    Perdida: {color: "#C62828", bg: "rgba(211,47,47,0.10)"},
};

type Props = {
    workerId: string;
    herramientas: Herramienta[];
    onEstadoCambiado: (id: string, estado: HerramientaEstado) => void;
    onEliminada: (id: string) => void;
    onCreada: (h: Herramienta) => void;
};

export default function TecnicoHerramientas({workerId, herramientas, onEstadoCambiado, onEliminada, onCreada}: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    const conteo = {
        Prestada: herramientas.filter((h) => h.estado === "Prestada").length,
        Dañada: herramientas.filter((h) => h.estado === "Dañada").length,
        Perdida: herramientas.filter((h) => h.estado === "Perdida").length,
    };

    return (
        <>
            <Card sx={{borderRadius: 4, border: "1px solid rgba(0,0,0,0.07)"}}>
                <CardContent sx={{p: 3}}>
                    {/* Header */}
                    <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                            <HandymanIcon sx={{fontSize: 18, color: "#5A5A72"}}/>
                            <Typography variant="body2" fontWeight={700}>Herramientas</Typography>
                            <Chip label={herramientas.length} size="small"
                                  sx={{
                                      height: 20,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      bgcolor: "rgba(0,0,0,0.06)",
                                      color: "#5A5A72"
                                  }}/>
                        </Box>
                        <Button size="small" startIcon={<AddIcon/>} onClick={() => setModalOpen(true)}
                                sx={{fontWeight: 700, fontSize: 12, color: "#1565C0"}}>
                            Prestar
                        </Button>
                    </Box>

                    {/* Resumen chips */}
                    {herramientas.length > 0 && (
                        <Box sx={{display: "flex", gap: 1, mb: 2, flexWrap: "wrap"}}>
                            {(["Prestada", "Dañada", "Perdida"] as HerramientaEstado[])
                                .filter((e) => conteo[e] > 0)
                                .map((e) => (
                                    <Chip key={e}
                                          label={`${conteo[e]} ${e}${conteo[e] > 1 ? "s" : ""}`}
                                          size="small"
                                          sx={{
                                              bgcolor: ESTILOS[e].bg,
                                              color: ESTILOS[e].color,
                                              fontWeight: 700,
                                              fontSize: 11,
                                              height: 22
                                          }}
                                    />
                                ))}
                        </Box>
                    )}

                    {/* Lista o vacío */}
                    {herramientas.length === 0 ? (
                        <Box sx={{textAlign: "center", py: 4}}>
                            <HandymanIcon sx={{fontSize: 40, color: "rgba(0,0,0,0.12)", mb: 1}}/>
                            <Typography variant="body2" color="text.secondary" mb={1.5}>
                                No hay herramientas registradas
                            </Typography>
                            <Button variant="outlined" size="small" startIcon={<AddIcon/>}
                                    onClick={() => setModalOpen(true)}
                                    sx={{borderRadius: 2.5, fontWeight: 700, borderColor: "#FFD600", color: "#B8860B"}}>
                                Registrar primera herramienta
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{display: "flex", flexDirection: "column", gap: 1}}>
                            {herramientas.map((h) => (
                                <HerramientaRow
                                    key={h.id} h={h}
                                    onEstadoCambiado={onEstadoCambiado}
                                    onEliminada={onEliminada}
                                />
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            <ModalNuevaHerramienta
                open={modalOpen}
                workerId={workerId}
                onClose={() => setModalOpen(false)}
                onCreada={onCreada}
            />
        </>
    );
}