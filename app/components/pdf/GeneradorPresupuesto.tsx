"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { pdf } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/client";
import { cotizacionesService } from "@/lib/data/cotizaciones";
import { Cotizaciones } from "@/lib/types/cotizaciones";
import {
    PresupuestoPDF,
    MaterialRow,
    DatosEmpresa,
    DatosCliente,
} from "./PresupuestoPDF";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BusinessIcon from "@mui/icons-material/Business";
import BuildIcon from "@mui/icons-material/Build";
import {User} from '@/lib/types/user'

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
    { ssr: false, loading: () => <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress sx={{ color: "#FFD600" }} /></Box> }
);


function uid() {
    return Math.random().toString(36).slice(2, 9);
}

function parseMonto(val: string) {
    const n = parseFloat(val.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
}

function formatMXN(val: number) {
    return val.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function folioHoy() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${uid().toUpperCase()}`;
}

function fechaHoy() {
    return new Date().toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric",
    });
}


type Props = {
    cotizacion: Cotizaciones;
    onEnviado: (costo: string) => void;
};


export default function GeneradorPresupuesto({ cotizacion, onEnviado }: Props) {
    const [cliente, setCliente] = useState<DatosCliente>({
        nombre: "Cargando...", telefono: "", email: "",
    });


    const [empresa, setEmpresa] = useState<DatosEmpresa>({
        nombre: "Yo Reparo",
        telefono: "+52 238 109 8104",
        email: "contacto@yoreparo.com",
        direccion: "Tehuacán, Puebla, México",
    });


    const [materiales, setMateriales] = useState<MaterialRow[]>([
        { id: uid(), descripcion: "", cantidad: "1", precioUnitario: "" },
    ]);


    const [manoDeObra, setManoDeObra] = useState("");
    const [tiempoEstimado, setTiempoEstimado] = useState("1-3 días hábiles");
    const [formaPago, setFormaPago] = useState("50% anticipo y 50% al finalizar");

    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const folio = folioHoy();
    const fecha = fechaHoy();


    useEffect(() => {
        if (!cotizacion.created_by) return;
        const supabase = createClient();
        supabase
            .from("profiles")
            .select("name, phone, email")
            .eq("id", cotizacion.created_by)
            .single()
            .then(({ data } :User) => {
                if (data) {
                    setCliente({
                        nombre: data.name ?? "—",
                        telefono: data.phone ?? "—",
                        email: data.email ?? "—",
                    });
                }
            });
    }, [cotizacion.created_by]);

    function addMaterial() {
        setMateriales((prev) => [
            ...prev,
            { id: uid(), descripcion: "", cantidad: "1", precioUnitario: "" },
        ]);
    }

    function removeMaterial(id: string) {
        setMateriales((prev) => prev.filter((m) => m.id !== id));
    }

    function updateMaterial(id: string, field: keyof MaterialRow, value: string) {
        setMateriales((prev) =>
            prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        );
    }

    const subtotalMat = materiales.reduce(
        (acc, m) => acc + parseMonto(m.cantidad) * parseMonto(m.precioUnitario),
        0
    );
    const mdo = parseMonto(manoDeObra);
    const total = subtotalMat + mdo;

    async function handleEnviar() {
        if (!manoDeObra) { setError("Ingresa el costo de mano de obra"); return; }
        const materialesValidos = materiales.filter(
            (m) => m.descripcion.trim() && m.precioUnitario
        );
        if (materialesValidos.length === 0) {
            setError("Agrega al menos un material con descripción y precio");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const blob = await pdf(
                <PresupuestoPDF
                    folio={folio}
                    fecha={fecha}
                    servicio={cotizacion.servicio ?? "Servicio"}
                    descripcionServicio={cotizacion.descripcion ?? ""}
                    empresa={empresa}
                    cliente={cliente}
                    materiales={materialesValidos}
                    manoDeObra={manoDeObra}
                    tiempoEstimado={tiempoEstimado}
                    formaPago={formaPago}
                    logoUrl="/logo.png"
                />
            ).toBlob();

            const file = new File(
                [blob],
                `presupuesto_${cotizacion.id}_${Date.now()}.pdf`,
                { type: "application/pdf" }
            );

            const pdfUrl = await cotizacionesService.uploadPdf(file, cotizacion.id);

            await cotizacionesService.enviarPresupuesto(
                cotizacion.id,
                String(total),
                pdfUrl
            );

            onEnviado(String(total));
        } catch (e) {
            console.error(e);
            setError("Error al generar o enviar el presupuesto. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    const pdfProps = {
        folio,
        fecha,
        servicio: cotizacion.servicio ?? "Servicio",
        descripcionServicio: cotizacion.descripcion ?? "",
        empresa,
        cliente,
        materiales: materiales.filter((m) => m.descripcion.trim()),
        manoDeObra,
        tiempoEstimado,
        formaPago,
        logoUrl: "/logo.png",
    };

    return (
        <Card sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.07)" }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                    Generar Presupuesto
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


                <Accordion
                    disableGutters
                    elevation={0}
                    sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px !important", mb: 3, "&:before": { display: "none" } }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <BusinessIcon sx={{ fontSize: 18, color: "#5A5A72" }} />
                            <Typography variant="body2" fontWeight={600}>
                                Datos de la empresa
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <TextField size="small" label="Nombre empresa" fullWidth
                                       value={empresa.nombre}
                                       onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} />
                            <TextField size="small" label="Teléfono" fullWidth
                                       value={empresa.telefono}
                                       onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })} />
                            <TextField size="small" label="Email" fullWidth
                                       value={empresa.email}
                                       onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })} />
                            <TextField size="small" label="Dirección" fullWidth
                                       value={empresa.direccion}
                                       onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })} />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                <Box sx={{ bgcolor: "rgba(255,214,0,0.08)", borderRadius: 2.5, p: 2, mb: 3, borderLeft: "3px solid #FFD600" }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1} textTransform="uppercase" letterSpacing={1}>
                        Cliente
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>{cliente.nombre}</Typography>
                    <Typography variant="caption" color="text.secondary">{cliente.email} · {cliente.telefono}</Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />


                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <BuildIcon sx={{ fontSize: 17, color: "#5A5A72" }} />
                        <Typography variant="body2" fontWeight={700}>Materiales</Typography>
                    </Box>
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={addMaterial}
                        sx={{ fontSize: 12, color: "#1565C0", fontWeight: 600 }}>
                        Agregar
                    </Button>
                </Box>


                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 0.7fr 1fr 1fr 36px",
                    gap: 1, px: 1, mb: 0.5,
                }}>
                    {["Descripción", "Cant.", "P. Unit.", "Total", ""].map((h) => (
                        <Typography key={h} variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" fontSize={10}>
                            {h}
                        </Typography>
                    ))}
                </Box>


                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                    {materiales.map((m) => {
                        const rowTotal = parseMonto(m.cantidad) * parseMonto(m.precioUnitario);
                        return (
                            <Box
                                key={m.id}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 0.7fr 1fr 1fr 36px",
                                    gap: 1, alignItems: "center",
                                    bgcolor: "rgba(0,0,0,0.02)",
                                    borderRadius: 2, p: 1,
                                }}
                            >
                                <TextField
                                    size="small" placeholder="Ej. Tubo de cobre"
                                    value={m.descripcion}
                                    onChange={(e) => updateMaterial(m.id, "descripcion", e.target.value)}
                                    sx={{ "& .MuiInputBase-input": { fontSize: 13 } }}
                                />
                                <TextField
                                    size="small" placeholder="1" type="number"
                                    value={m.cantidad}
                                    onChange={(e) => updateMaterial(m.id, "cantidad", e.target.value)}
                                    sx={{ "& .MuiInputBase-input": { fontSize: 13, textAlign: "center" } }}
                                />
                                <TextField
                                    size="small" placeholder="$0"
                                    value={m.precioUnitario}
                                    onChange={(e) => updateMaterial(m.id, "precioUnitario", e.target.value)}
                                    type="number"
                                    sx={{ "& .MuiInputBase-input": { fontSize: 13 } }}
                                />
                                <Typography variant="body2" fontWeight={700} color="#2E7D32" textAlign="right" pr={0.5}>
                                    {formatMXN(rowTotal)}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => removeMaterial(m.id)}
                                    disabled={materiales.length === 1}
                                    sx={{ color: "#C62828" }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{ bgcolor: "#EEF2FF", borderRadius: 2.5, p: 2, mb: 3 }}>
                    <Typography variant="body2" fontWeight={700} mb={1.5}>
                        Mano de obra
                    </Typography>
                    <TextField
                        size="small" fullWidth
                        label="Costo de mano de obra ($)"
                        placeholder="Ej. 800"
                        type="number"
                        value={manoDeObra}
                        onChange={(e) => setManoDeObra(e.target.value)}
                    />
                </Box>

                <Box sx={{ bgcolor: "#1A1A2E", borderRadius: 2.5, p: 2, mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">Subtotal materiales</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">{formatMXN(subtotalMat)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">Mano de obra</Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">{formatMXN(mdo)}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" fontWeight={800} color="#FFD600">TOTAL</Typography>
                        <Typography variant="body2" fontWeight={800} color="#FFD600">{formatMXN(total)}</Typography>
                    </Box>
                </Box>

                <Accordion
                    disableGutters elevation={0}
                    sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px !important", mb: 3, "&:before": { display: "none" } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" fontWeight={600}>Tiempo y forma de pago</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <TextField size="small" label="Tiempo estimado" fullWidth
                                       value={tiempoEstimado}
                                       onChange={(e) => setTiempoEstimado(e.target.value)} />
                            <TextField size="small" label="Forma de pago" fullWidth
                                       value={formaPago}
                                       onChange={(e) => setFormaPago(e.target.value)} />
                        </Box>
                    </AccordionDetails>
                </Accordion>


                <Button fullWidth variant="outlined" size="large" startIcon={<PictureAsPdfIcon />}
                    onClick={() => setShowPreview(!showPreview)}
                    sx={{
                        mb: 2, borderRadius: 3, fontWeight: 700,
                        borderColor: "#1565C0", color: "#1565C0",
                        "&:hover": { bgcolor: "rgba(21,101,192,0.06)" },
                    }}>
                    {showPreview ? "Ocultar vista previa" : "Vista previa del PDF"}
                </Button>

                {showPreview && (
                    <Box sx={{ height: 500, mb: 2, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
                        <PDFViewer width="100%" height="100%" showToolbar={false}>
                            <PresupuestoPDF {...pdfProps} />
                        </PDFViewer>
                    </Box>
                )}

                <Button
                    fullWidth variant="contained" size="large"
                    disabled={loading}
                    onClick={handleEnviar}
                    endIcon={loading
                        ? <CircularProgress size={18} color="inherit" />
                        : <SendIcon />
                    }
                    sx={{
                        py: 1.6, fontSize: 15, fontWeight: 800, borderRadius: 3,
                        bgcolor: "#1565C0", color: "#fff",
                        "&:hover": { bgcolor: "#0D47A1" },
                        "&:disabled": { bgcolor: "rgba(21,101,192,0.4)", color: "#fff" },
                    }}
                >
                    {loading ? "Generando y enviando..." : "Generar y Enviar Presupuesto"}
                </Button>
            </CardContent>
        </Card>
    );
}