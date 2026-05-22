"use client";

import {useState, useEffect} from "react";
import {
    Box, Typography, IconButton, Modal, Fade, Backdrop, Divider, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material";
import {
    Close as CloseIcon, Build as BuildIcon, Person,
    CalendarToday, Tag
} from "@mui/icons-material";
import {Herramienta} from "@/lib/types/herramienta";
import {User} from "@/lib/types/user";
import {herramientasService} from "@/lib/data/herramientas";
import {tecnicosService} from "@/lib/data/tecnicos";

const modalStyle = {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {xs: '90%', sm: 800},
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24, p: 4, outline: 'none',
};

type Props = {
    open: boolean;
    onClose: () => void;
    herramienta: Herramienta | null;
    onSuccess?: () => void;
};

function formatFecha(fecha?: string) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-MX", {day: "2-digit", month: "short", year: "numeric"});
}

export default function InfoHerramientaModal({open, onClose, herramienta, onSuccess}: Props) {
    const [activeDialog, setActiveDialog] = useState<"none" | "prestar" | "baja" | "perdida" | "entregada">("none");

    const [loading, setLoading] = useState(false);
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    const [loadingWorkers, setLoadingWorkers] = useState(false);

    const [selectedWorkerId, setSelectedWorkerId] = useState("");

    useEffect(() => {
        if (activeDialog === "prestar" && tecnicos.length === 0) {
            setLoadingWorkers(true);
            tecnicosService.getTecnicos()
                .then(setTecnicos)
                .catch(console.error)
                .finally(() => setLoadingWorkers(false));
        }
    }, [activeDialog]);

    if (!herramienta) return null;
    const isPrestado = herramienta.estado?.toLowerCase() === "prestada";

    const handleConfirmAction = async () => {
        if (!herramienta.id) return;

        try {
            setLoading(true);

            switch (activeDialog) {
                case "baja":
                    await herramientasService.eliminar(herramienta.id);
                    window.location.reload();
                    break;
                case "perdida":
                    await herramientasService.actualizarEstado(herramienta.id, 'Perdida');
                    window.location.reload();
                    break;
                case "entregada":
                    await herramientasService.devolverHerramienta(herramienta.id);
                    window.location.reload();
                    break;
                case "prestar":
                    if (!selectedWorkerId) return;
                    await herramientasService.prestarHerramienta(herramienta.id, selectedWorkerId);
                    window.location.reload();
                    break;
            }

            setActiveDialog("none");
            if (onSuccess) onSuccess();
            onClose();

        } catch (error) {
            alert("Ocurrió un error. Intenta de nuevo más tarde");
        } finally {
            setLoading(false);
        }
    };

    const closeDialog = () => setActiveDialog("none");

    return (
        <>

            <Modal open={open} onClose={onClose} closeAfterTransition slots={{backdrop: Backdrop}}
                   slotProps={{backdrop: {timeout: 500}}}>
                <Fade in={open}>
                    <Box sx={modalStyle}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2}}>
                            <Box>
                                <Typography variant="h5" fontWeight={700}
                                            sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <BuildIcon color="primary"/> {herramienta.tool || "Detalle"}
                                </Typography>
                                <Chip label={herramienta.estado || "Desconocido"} size="small"
                                      sx={{mt: 1, fontWeight: 600}} color={isPrestado ? "warning" : "success"}
                                      variant="outlined"/>
                            </Box>
                            <IconButton onClick={onClose} size="small"><CloseIcon/></IconButton>
                        </Box>

                        <Divider sx={{my: 2}}/>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
                            <Box>
                                <Typography variant="overline" color="text.secondary" fontWeight={600}>Información
                                    General</Typography>
                                <Typography variant="body1"><strong>ID:</strong> {herramienta.id || "N/A"}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="overline" color="text.secondary" fontWeight={600}>Estado
                                    Actual</Typography>
                                {isPrestado && herramienta.trabajador && (
                                    <Box mt={1}>
                                        <Typography variant="caption" color="text.secondary">
                                            <Person fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                            Prestada a: {herramienta.trabajador.name}
                                        </Typography>
                                        {herramienta.fecha_prestamo && (
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                <CalendarToday fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                Desde: {formatFecha(herramienta.fecha_prestamo)}
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                <Box sx={{display: "flex", justifyContent: "flex-end", gap: 2, my: 2}}>
                                    {isPrestado ? (
                                        <>
                                            <Button color="error"
                                                    onClick={() => setActiveDialog("perdida")}>
                                                Marcar como perdida
                                            </Button>
                                            <Button variant="contained" color="primary"
                                                    onClick={() => setActiveDialog("entregada")}>
                                                Marcar como entregada
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button color="error"
                                                    onClick={() => setActiveDialog("baja")}>
                                                Dar de Baja
                                            </Button>
                                            <Button variant="contained" color="primary"
                                                    onClick={() => setActiveDialog("prestar")}>
                                                Prestar Herramienta
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            <Dialog open={activeDialog === "prestar"} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>Prestar Herramienta</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2}}>
                        Selecciona al trabajador al que se le asignará la
                        herramienta <strong>{herramienta.tool}</strong>.
                    </DialogContentText>
                    <FormControl fullWidth>
                        <InputLabel>Trabajador</InputLabel>
                        <Select
                            value={selectedWorkerId}
                            label="Trabajador"
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            disabled={loading || loadingWorkers}
                        >
                            {loadingWorkers ? (
                                <MenuItem disabled><CircularProgress size={20} /> Cargando...</MenuItem>
                            ) : (
                                tecnicos.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleConfirmAction} variant="contained" disabled={!selectedWorkerId || loading}>
                        {loading ? <CircularProgress size={24}/> : "Confirmar Préstamo"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={["baja", "perdida", "entregada"].includes(activeDialog)} onClose={closeDialog}>
                <DialogTitle>
                    {activeDialog === "baja" && "Dar de baja herramienta"}
                    {activeDialog === "perdida" && "Reportar como perdida"}
                    {activeDialog === "entregada" && "Confirmar entrega"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {activeDialog === "baja" && `¿Estás seguro que deseas eliminar permanentemente la herramienta "${herramienta.tool}"? Esta acción no se puede deshacer.`}
                        {activeDialog === "perdida" && `¿Estás seguro que deseas marcar la herramienta "${herramienta.tool}" como PERDIDA?`}
                        {activeDialog === "entregada" && `¿Confirmas que el trabajador devolvió la herramienta "${herramienta.tool}" en buen estado?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={loading}>Cancelar</Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={activeDialog === "entregada" ? "primary" : "error"}
                        disabled={loading}>
                        {loading ? <CircularProgress size={24}/> : "Confirmar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}