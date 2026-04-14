"use client";

import {useState} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import HandymanIcon from "@mui/icons-material/Handyman";
import {herramientasService} from "@/lib/data/herramientas";
import {Herramienta} from "@/lib/types/herramienta";

type Props = {
    open: boolean;
    workerId: string;
    onClose: () => void;
    onCreada: (h: Herramienta) => void;
};

export default function ModalNuevaHerramienta({open, workerId, onClose, onCreada}: Props) {
    const [tool, setTool] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGuardar() {
        if (!tool.trim()) {
            setError("El nombre de la herramienta es requerido");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const nueva = await herramientasService.prestarHerramienta(workerId, tool.trim());
            onCreada(nueva);
            setTool("");
            onClose();
        } catch {
            setError("No se pudo registrar la herramienta");
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        setTool("");
        setError(null);
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
                PaperProps={{sx: {borderRadius: 4}}}>
            <Box sx={{bgcolor: "#1A1A2E", px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5}}>
                <Box sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: "#FFD600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <HandymanIcon sx={{fontSize: 16, color: "#1A1A2E"}}/>
                </Box>
                <Typography fontWeight={800} color="#fff" fontSize={15}>
                    Prestar herramienta
                </Typography>
            </Box>

            <DialogContent sx={{pt: 3}}>
                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
                <TextField
                    autoFocus fullWidth size="small"
                    label="Nombre de la herramienta"
                    placeholder="Ej. Taladro, Llave inglesa, Multímetro"
                    value={tool}
                    onChange={(e) => setTool(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
                />
                <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: "block"}}>
                    Se registrará con estado <strong>Prestada</strong> automáticamente.
                </Typography>
            </DialogContent>

            <DialogActions sx={{px: 3, pb: 3}}>
                <Button onClick={handleClose} disabled={loading} sx={{borderRadius: 2, color: "text.secondary"}}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleGuardar} disabled={loading}
                        endIcon={loading ? <CircularProgress size={14} color="inherit"/> : null}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            bgcolor: "#FFD600",
                            color: "#1A1A2E",
                            "&:hover": {bgcolor: "#F9A800"}
                        }}>
                    {loading ? "Guardando..." : "Registrar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}