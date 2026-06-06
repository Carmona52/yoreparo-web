"use client";

import {useState} from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    Modal,
    Fade,
    Backdrop, TextField,
    CircularProgress,
} from "@mui/material";
import {Close as CloseIcon, Add as AddIcon} from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import {herramientasService} from "@/lib/data/herramientas";
import {createHerramienta} from "@/lib/types/herramienta";
import FormControl from "@mui/material/FormControl";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {xs: '90%', sm: 800},
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
};

export default function RegistrarNuevaHerramienta() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<createHerramienta>({
        tool: '',
        estado: 'En inventario',
        fecha_prestamo: new Date().toISOString().split('T')[0],
    })
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false),
            setForm({tool: '', estado: 'En inventario', fecha_prestamo: new Date().toISOString().split('T')[0]});
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    };

    async function onSave() {
        if (!form.tool) {
            alert("El nombre de la herramienta es obligatorio");
            return;
        }

        try {
            setLoading(true);
            await herramientasService.insertNewHerramienta(form);
            handleClose();

        } catch (error) {
            alert("Hubo un error al guardar la herramienta.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button variant="contained" startIcon={<AddIcon/>} onClick={handleOpen}>
                Añadir una nueva herramienta
            </Button>
            <Modal open={open} onClose={handleClose}
                   closeAfterTransition
                   slots={{backdrop: Backdrop}}
                   slotProps={{backdrop: {timeout: 500}}}>
                <Fade in={open}>
                    <Box sx={modalStyle}>

                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                            <Typography variant="h6" sx={{
                                fontWeight: 700
                            }}>
                                Registrar una nueva herramienta
                            </Typography>
                            <IconButton onClick={handleClose} size="small">
                                <CloseIcon/>
                            </IconButton>
                        </Box>

                        <Divider/>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                            <FormControl>
                                <TextField
                                    label="Nombre de la Herramienta"
                                    name="tool"
                                    value={form.tool}
                                    onChange={handleChange}
                                    fullWidth
                                    disabled={loading}
                                />
                            </FormControl>
                            <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2}}>
                                <Button onClick={handleClose} disabled={loading} color='error'>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={onSave}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20}/> : null}>
                                    {loading ? "Guardando..." : "Guardar"}
                                </Button>
                            </Box>
                        </Box>

                    </Box>
                </Fade>
            </Modal>
        </>
    );
}