"use client";
import * as React from "react";
import {TransitionProps} from "@mui/material/transitions";
import Slide from "@mui/material/Slide";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Alert,
    FormControl,
    TextField,
    CircularProgress,
} from "@mui/material";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface ModalProps {
    open: boolean;
    onClose: () => void;
}

export default function ModalRecoveryPassword({open, onClose}: ModalProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const supabase = createClient();

    const handleReset = async () => {
        if (!email) {
            setAlert({type: "error", message: "Por favor ingrese su email"});
            return;
        }
        setLoading(true);
        setAlert(null);

        try {
            const {error} = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: "https://yoreparo-web.vercel.app/reset-password",
            });
            if (error) throw error;

            setAlert({
                type: "success",
                message: "Correo enviado, revisa tu bandeja de entrada.",
            });
        } catch (error) {
            setAlert({
                type: "error",
                message: "Error al enviar el correo, intente más tarde.",
            });
        } finally {
            setLoading(false);
            setTimeout(() => onClose(), 2000);
        }
    };

    return (
        <Dialog
            open={open}
            slots={{
                transition: Transition,
            }}
            keepMounted
            onClose={onClose}
            aria-describedby="alert-dialog-slide-description"
            role="alertdialog">
            <DialogTitle>{"Restablecer contraseña"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    Ingrese su dirección de Email para enviar una liga de restauración de contraseña.
                </DialogContentText>

                <FormControl sx={{mt: 2}} fullWidth>
                    <TextField
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>

                {/* Mostrar alertas */}
                {alert && (
                    <Alert severity={alert.type} sx={{mt: 2}}>
                        {alert.message}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{margin: "auto", minWidth: "80%"}}>
                <Button variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleReset}
                    disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit"/> : "Aceptar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
