"use client";

import {useState} from "react";
import {
    Box,
    TextField,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    Typography,
    IconButton,
    InputAdornment,
    Modal,
    Fade,
    Backdrop,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import {Visibility, VisibilityOff, Close as CloseIcon, Add as AddIcon} from "@mui/icons-material";
import {supabase} from "@/lib/supabase/supabase";

type Role = "worker" | "supervisor" | "owner";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {xs: '90%', sm: 500},
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
};

export async function createWorkerByAdmin(
    email: string,
    password: string,
    name: string,
    phone: string,
    role: Role
) {
    const {data, error} = await supabase.functions.invoke('quick-endpoint', {
        body: {email, password, name, phone, role}
    });

    if (error) throw new Error(error.message || 'Error al crear el trabajador');
    if (data && data.error) throw new Error(data.error);
    return data;
}

export default function NewWorkerModal({onWorkerCreated}: { onWorkerCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("worker");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({open: false, message: "", severity: "success"});

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        if (!loading) {
            setOpen(false);
            resetForm();
        }
    };

    const resetForm = () => {
        setEmail("");
        setName("");
        setPhone("");
        setPassword("");
        setRole("worker");
        setShowPassword(false);
    };

    const createWorker = async () => {
        if (!email || !name || !password) {
            setSnackbar({open: true, message: "Nombre, correo y contraseña son obligatorios", severity: "error"});
            return;
        }

        setLoading(true);
        try {

            await createWorkerByAdmin(email, password, name, phone, role);
            setSnackbar({open: true, message: "Trabajador creado correctamente", severity: "success"});
            if (onWorkerCreated) onWorkerCreated();
            setTimeout(handleClose, 1500);
        } catch (err) {
            setSnackbar({open: true, message: "Error inesperado", severity: "error"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                startIcon={<AddIcon/>}
                onClick={handleOpen}>
                Agregar Personal
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{backdrop: Backdrop}}
                slotProps={{backdrop: {timeout: 500}}}
            >
                <Fade in={open}>
                    <Box sx={modalStyle}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                            <Typography variant="h6" sx={{
                                fontWeight: 700
                            }}>Añadir Nuevo Técnico</Typography>
                            <IconButton onClick={handleClose} disabled={loading} size="small">
                                <CloseIcon/>
                            </IconButton>
                        </Box>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                            <TextField
                                label="Nombre completo *"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />

                            <FormControl fullWidth margin="dense">
                                <InputLabel id="role-select-label">Cargo / Rol *</InputLabel>
                                <Select
                                    labelId="role-select-label"
                                    value={role}
                                    label="Cargo / Rol *"
                                    onChange={(e) => setRole(e.target.value as Role)}
                                    disabled={loading}
                                >
                                    <MenuItem value="worker">Técnico / Trabajador</MenuItem>
                                    <MenuItem value="supervisor">Supervisor</MenuItem>
                                    <MenuItem value="owner">Administrador</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Correo electrónico *"
                                fullWidth
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />

                            <TextField
                                label="Teléfono"
                                fullWidth
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={loading}
                            />

                            <TextField
                                label="Contraseña *"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={createWorker}
                            disabled={loading}
                            sx={{mt: 3, py: 1.5, fontWeight: 700}}
                        >
                            {loading ? <CircularProgress size={24} color="inherit"/> : "Guardar Técnico"}
                        </Button>
                    </Box>
                </Fade>
            </Modal>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{width: "100%"}}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}