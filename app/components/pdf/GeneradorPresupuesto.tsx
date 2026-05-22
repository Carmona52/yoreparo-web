"use client";

import {useState, useEffect, useMemo} from "react";
import dynamic from "next/dynamic";
import {pdf} from "@react-pdf/renderer";
import {createClient} from "@/lib/supabase/client";
import {cotizacionesService} from "@/lib/data/cotizaciones";
import {Cotizaciones} from "@/lib/types/cotizaciones";
import {PresupuestoPDF, ServicioBloque, DatosEmpresa, DatosCliente, MaterialRow} from "./PresupuestoPDF";

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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BusinessIcon from "@mui/icons-material/Business";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
    {ssr: false, loading: () => <Box sx={{p: 4, textAlign: "center"}}><CircularProgress sx={{color: "#FFD600"}}/></Box>}
);

interface ProfileData {
    data: {
        name: string | null;
        phone: string | null;
        email: string | null;
    }
}

const SERVICIOS_DISPONIBLES = [
    {label: "Servicio Eléctrico", color: "#FF9800"},
    {label: "Servicio de Plomería", color: "#4CAF50"},
    {label: "Carpintería", color: "#2196F3"},
    {label: "Pintura", color: "#9C27B0"},
    {label: "Albañilería", color: "#F44336"},
    {label: "Instalación de Gas", color: "#00BCD4"},
    {label: "Aire Acondicionado", color: "#8BC34A"},
    {label: "Herrería", color: "#FF5722"},
    {label: "Jardinería", color: "#4CAF50"},
    {label: "Limpieza", color: "#2196F3"},
    {label: "Otro", color: "#9C27B0"}
];

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

function parseMonto(val: string) {
    const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
}

function formatMXN(val: number) {
    return val.toLocaleString("es-MX", {style: "currency", currency: "MXN"});
}

function folioHoy() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${uid().toUpperCase()}`;
}

function fechaHoy() {
    return new Date().toLocaleDateString("es-MX", {day: "2-digit", month: "long", year: "numeric"});
}

function nuevoServicio(nombre = ""): ServicioBloque {
    return {
        id: uid(),
        nombre,
        color: 'white',
        materiales: [{id: uid(), descripcion: "", cantidad: "1", precioUnitario: ""}],
    };
}


function BloqueServicio({
                            bloque,
                            onUpdate,
                            onRemove,
                            canRemove,
                        }: {
    bloque: ServicioBloque;
    index: number;
    onUpdate: (b: ServicioBloque) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const [nombre, setNombre] = useState("");
    const subtotal = bloque.materiales.reduce(
        (acc, m) => acc + parseMonto(m.cantidad) * parseMonto(m.precioUnitario), 0
    );

    function updateMat(id: string, field: keyof MaterialRow, value: string) {
        onUpdate({
            ...bloque,
            materiales: bloque.materiales.map((m) => m.id === id ? {...m, [field]: value} : m),
        });
    }

    function addMat() {
        onUpdate({
            ...bloque,
            materiales: [...bloque.materiales, {id: uid(), descripcion: "", cantidad: "1", precioUnitario: ""}]
        });
    }

    function removeMat(id: string) {
        onUpdate({...bloque, materiales: bloque.materiales.filter((m) => m.id !== id)});
    }

    return (
        <Box sx={{mb: 2, border: `2px solid ${bloque.color}22`, borderRadius: 1, overflow: "hidden"}}>
            <Box sx={{bgcolor: bloque.color, px: 2, py: 1.5, display: "flex", gap: 2, alignItems: "center"}}>

                {nombre.length != 0 ? <Typography variant="body2" fontWeight={800} color={contrastColor(bloque.color)} flex={1}> {nombre}</Typography> :
                    <Typography variant="body2" fontWeight={800} color='black' flex={1}> Por favor, elija un servicio </Typography>}

                <FormControl size="small" sx={{minWidth: 280, "& .MuiInputBase-root": {bgcolor: "rgba(255,255,255,0.15)", color: contrastColor(bloque.color)}}}>
                    <Select value={bloque.nombre} onChange={(e) => {
                            const selectedLabel = e.target.value;
                            const servicio = SERVICIOS_DISPONIBLES.find(s => s.label === selectedLabel);
                            setNombre(selectedLabel)
                            onUpdate({
                                ...bloque,
                                nombre: selectedLabel,
                                color: servicio ? servicio.color : bloque.color
                            });
                        }}
                         sx={{
                        fontSize: 16,
                        fontWeight: 700,
                        bgcolor: "rgb(2,33,29)",
                        color: "rgb(2,33,29)",
                    }}>
                        <MenuItem value="" disabled><em color='black'>Seleccionar servicio</em></MenuItem>
                        {SERVICIOS_DISPONIBLES.map((s) => (
                            <MenuItem key={s.label} value={s.label}>{s.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>


                {canRemove && (
                    <IconButton size="small" onClick={onRemove} sx={{color: contrastColor(bloque.color), opacity: 0.8}}>
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                )}
            </Box>

            <Box sx={{p: 2}}>
                <Box sx={{display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 1fr 36px", gap: 1, px: 1, mb: 0.5}}>
                    {["Descripción", "Cant.", "P. Unit.", "Total", ""].map((h) => (
                        <Typography key={h} variant="caption" color="text.secondary" fontWeight={700} fontSize={12}
                                    textTransform="uppercase">{h}</Typography>
                    ))}
                </Box>

                <Box sx={{display: "flex", flexDirection: "column", gap: 0.8}}>
                    {bloque.materiales.map((m) => {
                        const rowTotal = parseMonto(m.cantidad) * parseMonto(m.precioUnitario);
                        return (
                            <Box key={m.id} sx={{
                                display: "grid",
                                gridTemplateColumns: "2fr 0.7fr 1fr 1fr 36px",
                                gap: 1,
                                alignItems: "center",
                                bgcolor: "rgba(0,0,0,0.02)",
                                borderRadius: 1,
                                p: 0.8
                            }}>
                                <TextField size="small" placeholder="Material o insumo"
                                           value={m.descripcion}
                                           onChange={(e) => updateMat(m.id, "descripcion", e.target.value)}
                                           sx={{"& .MuiInputBase-input": {fontSize: 14}}}/>
                                <TextField size="small" placeholder="1" type="number"
                                           value={m.cantidad}
                                           onChange={(e) => updateMat(m.id, "cantidad", e.target.value)}
                                           sx={{"& .MuiInputBase-input": {fontSize: 14, textAlign: "center"}}}/>
                                <TextField size="small" placeholder="$0" type="number"
                                           value={m.precioUnitario}
                                           onChange={(e) => updateMat(m.id, "precioUnitario", e.target.value)}
                                           sx={{"& .MuiInputBase-input": {fontSize: 14}}}/>
                                <Typography variant="body2" fontWeight={700} color="#2E7D32" textAlign="right" pr={0.5}
                                            fontSize={14}>
                                    {formatMXN(rowTotal)}
                                </Typography>
                                <IconButton size="small" onClick={() => removeMat(m.id)}
                                            disabled={bloque.materiales.length === 1} sx={{color: "#C62828"}}>
                                    <DeleteIcon sx={{fontSize: 15}}/>
                                </IconButton>
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5}}>
                    <Button size="large" startIcon={<AddIcon/>} onClick={addMat}
                            sx={{fontSize: 14, color: "#1565C0", fontWeight: 700}}>
                        Agregar material
                    </Button>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <Typography variant="caption" color="text.secondary">Subtotal:</Typography>
                        <Typography variant="body2" fontWeight={800}
                                    color={bloque.color}>{formatMXN(subtotal)}</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function contrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#1A1A2E" : "#FFFFFF";
}


type Props = {
    cotizacion: Cotizaciones;
    onEnviado: (costo: string) => void;
};

export default function GeneradorPresupuesto({cotizacion, onEnviado}: Props) {
    const supabase = createClient();
    const [tab, setTab] = useState(0);

    const [empresa, setEmpresa] = useState<DatosEmpresa>({
        nombre: "Yo Reparo", telefono: "+52 238 109 8104",
        email: "contacto@yoreparo.com", direccion: "Puebla, México",
    });

    const [cliente, setCliente] = useState<DatosCliente>({nombre: "Cargando...", telefono: "", email: ""});
    const [servicios, setServicios] = useState<ServicioBloque[]>([nuevoServicio()]);
    const [manoDeObra, setManoDeObra] = useState("");
    const [tiempoEstimado, setTiempoEstimado] = useState("1-3 días hábiles");
    const [formaPago, setFormaPago] = useState("50% anticipo y 50% al finalizar");
    const [conIva, setConIva] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [loadingSubir, setLoadingSubir] = useState(false);

    const folio = useMemo(() => folioHoy(), []);
    const fecha = fechaHoy();

    useEffect(() => {
        if (!cotizacion.created_by) return;
        supabase.from("profiles").select("name, phone, email").eq("id", cotizacion.created_by).single()
            .then(({data}: ProfileData) => {
                if (data) setCliente({nombre: data.name ?? "—", telefono: data.phone ?? "—", email: data.email ?? "—"});
            });
    }, [cotizacion.created_by]);

    const subtotalMat = servicios.reduce((acc, sv) =>
        acc + sv.materiales.reduce((a, m) => a + parseMonto(m.cantidad) * parseMonto(m.precioUnitario), 0), 0
    );
    const mdo = parseMonto(manoDeObra);
    const subtotal = subtotalMat + mdo;
    const iva = conIva ? subtotal * 0.16 : 0;
    const total = subtotal + iva;

    const pdfProps = {
        folio, fecha, empresa, cliente,
        servicios: servicios.filter((sv) => sv.nombre),
        manoDeObra, tiempoEstimado, formaPago, conIva,
        logoUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/logo.png`,
        marcaAguaUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/trabajador.jpeg`,
        logoYoReparo: `${typeof window !== "undefined" ? window.location.origin : ""}/Yoreparo1024.png`,
    };

    async function handleEnviar() {
        if (!manoDeObra) {
            setError("Ingresa el costo de mano de obra");
            return;
        }
        const serviciosValidos = servicios.filter((sv) => sv.nombre && sv.materiales.some((m) => m.descripcion && m.precioUnitario));
        if (serviciosValidos.length === 0) {
            setError("Agrega al menos un servicio con materiales");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const blob = await pdf(<PresupuestoPDF {...pdfProps} />).toBlob();
            const file = new File([blob], `presupuesto_${cotizacion.id}_${Date.now()}.pdf`, {type: "application/pdf"});
            const pdfUrl = await cotizacionesService.uploadPdf(file, cotizacion.id);
            await cotizacionesService.enviarPresupuesto(cotizacion.id, String(total), pdfUrl);
            onEnviado(String(total));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al generar el presupuesto");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubirPdf() {
        if (!pdfFile) {
            setError("Selecciona un archivo PDF");
            return;
        }
        setLoadingSubir(true);
        setError(null);
        try {
            const pdfUrl = await cotizacionesService.uploadPdf(pdfFile, cotizacion.id);
            await cotizacionesService.enviarPresupuesto(cotizacion.id, "0", pdfUrl);
            onEnviado("0");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al subir el archivo");
        } finally {
            setLoadingSubir(false);
        }
    }

    return (
        <Card sx={{borderRadius: 1, border: "1px solid rgba(0,0,0,0.07)"}}>
            <CardContent sx={{p: 3}}>
                <Typography variant="h6" fontWeight={700} mb={2}>Generar Presupuesto</Typography>

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                    mb: 3, borderBottom: "1px solid rgba(0,0,0,0.08)",
                    "& .MuiTab-root": {textTransform: "none", fontWeight: 600, fontSize: 16},
                    "& .Mui-selected": {color: "#1565C0"},
                    "& .MuiTabs-indicator": {bgcolor: "#FFD600", height: 3},
                }}>
                    <Tab label="Generar PDF" icon={<PictureAsPdfIcon sx={{fontSize: 16}}/>} iconPosition="start"/>
                    <Tab label="Subir PDF" icon={<UploadFileIcon sx={{fontSize: 16}}/>} iconPosition="start"/>
                </Tabs>

                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

                {tab === 0 && (
                    <>
                        <Accordion disableGutters elevation={0}
                                   sx={{
                                       border: "1px solid rgba(0,0,0,0.08)",
                                       borderRadius: "10px !important",
                                       mb: 3,
                                       "&:before": {display: "none"}
                                   }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                    <BusinessIcon sx={{fontSize: 19, color: "#5A5A72"}}/>
                                    <Typography fontWeight={600}>Datos de la empresa</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{pt: 0}}>
                                <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
                                    {(["nombre", "telefono", "email", "direccion"] as (keyof DatosEmpresa)[]).map((k) => (
                                        <TextField key={k} size="small" fullWidth
                                                   label={k.charAt(0).toUpperCase() + k.slice(1)}
                                                   value={empresa[k]}
                                                   onChange={(e) => setEmpresa((p) => ({...p, [k]: e.target.value}))}/>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Box sx={{
                            bgcolor: "rgba(255,214,0,0.08)",
                            borderRadius: 2.5,
                            p: 2,
                            mb: 3,
                            borderLeft: "3px solid #FFD600"
                        }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}
                                        textTransform="uppercase" letterSpacing={1}>Cliente</Typography>
                            <Typography variant="body2" fontWeight={700}>{cliente.nombre}</Typography>
                            <Typography variant="caption"
                                        color="text.secondary">{cliente.email} · {cliente.telefono}</Typography>
                        </Box>

                        <Divider sx={{mb: 3}}/>

                        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2}}>
                            <Typography fontWeight={700}>Servicios</Typography>
                            <Button size="large" startIcon={<AddIcon/>}
                                    onClick={() => setServicios((p) => [...p, nuevoServicio()])}
                                    sx={{fontSize: 16, fontWeight: 700, color: "#1565C0"}}>
                                Añadir servicio
                            </Button>
                        </Box>

                        {servicios.map((sv, i) => (
                            <BloqueServicio
                                key={sv.id}
                                bloque={sv}
                                index={i}
                                onUpdate={(b) => setServicios((p) => p.map((x) => x.id === b.id ? b : x))}
                                onRemove={() => setServicios((p) => p.filter((x) => x.id !== sv.id))}
                                canRemove={servicios.length > 1}
                            />
                        ))}

                        <Box sx={{bgcolor: "#EEF2FF", borderRadius: 1, p: 2, mb: 2}}>
                            <Typography variant="body2" fontWeight={700} mb={1.5}>Mano de obra (global)</Typography>
                            <TextField size="small" fullWidth label="Costo ($)" type="number"
                                       value={manoDeObra} onChange={(e) => setManoDeObra(e.target.value)}/>
                        </Box>

                        {/* IVA */}
                        <Box sx={{
                            bgcolor: "rgba(46,125,50,0.06)",
                            borderRadius: 1,
                            px: 2,
                            py: 1,
                            mb: 3,
                            border: "1px solid rgba(46,125,50,0.15)"
                        }}>
                            <FormControlLabel
                                control={<Checkbox checked={conIva} onChange={(e) => setConIva(e.target.checked)}
                                                   sx={{color: "#2E7D32", "&.Mui-checked": {color: "#2E7D32"}}}/>}
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight={700}>Incluir IVA (16%)</Typography>
                                        <Typography variant="caption" color="text.secondary">Para clientes que requieren
                                            factura</Typography>
                                    </Box>
                                }
                            />
                        </Box>

                        <Box sx={{bgcolor: "#1A1A2E", borderRadius: 1, p: 2, mb: 3}}>
                            <Box sx={{display: "flex", justifyContent: "space-between", mb: 0.5}}>
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Subtotal
                                    materiales</Typography>
                                <Typography variant="caption"
                                            color="rgba(255,255,255,0.7)">{formatMXN(subtotalMat)}</Typography>
                            </Box>
                            <Box sx={{display: "flex", justifyContent: "space-between", mb: conIva ? 0.5 : 1.5}}>
                                <Typography variant="caption" color="rgba(255,255,255,0.5)">Mano de obra</Typography>
                                <Typography variant="caption"
                                            color="rgba(255,255,255,0.7)">{formatMXN(mdo)}</Typography>
                            </Box>
                            {conIva && (
                                <Box sx={{display: "flex", justifyContent: "space-between", mb: 1.5}}>
                                    <Typography variant="caption" color="#81C784">IVA (16%)</Typography>
                                    <Typography variant="caption" color="#81C784"
                                                fontWeight={700}>{formatMXN(iva)}</Typography>
                                </Box>
                            )}
                            <Divider sx={{borderColor: "rgba(255,255,255,0.1)", mb: 1.5}}/>
                            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                <Typography variant="body2" fontWeight={800} color="#FFD600">TOTAL</Typography>
                                <Typography variant="body2" fontWeight={800}
                                            color="#FFD600">{formatMXN(total)}</Typography>
                            </Box>
                        </Box>

                        <Accordion disableGutters elevation={0}
                                   sx={{
                                       border: "1px solid rgba(0,0,0,0.08)",
                                       borderRadius: "10px !important",
                                       mb: 3,
                                       "&:before": {display: "none"}
                                   }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Typography fontWeight={600}>Tiempo y forma de pago</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{pt: 0}}>
                                <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
                                    <TextField size="medium" label="Tiempo estimado" fullWidth value={tiempoEstimado}
                                               onChange={(e) => setTiempoEstimado(e.target.value)}/>
                                    <TextField size="medium" label="Forma de pago" fullWidth value={formaPago}
                                               onChange={(e) => setFormaPago(e.target.value)}/>
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                        <Button fullWidth variant="outlined" size="large" startIcon={<PictureAsPdfIcon/>}
                                onClick={() => setShowPreview(!showPreview)}
                                sx={{
                                    mb: 2,
                                    borderRadius: 1,
                                    fontWeight: 700,
                                    borderColor: "#1565C0",
                                    color: "#1565C0",
                                    "&:hover": {bgcolor: "rgba(21,101,192,0.06)"}
                                }}>
                            {showPreview ? "Ocultar vista previa" : "Vista previa del PDF"}
                        </Button>

                        {showPreview && (
                            <Box sx={{
                                height: 520,
                                mb: 2,
                                borderRadius: 1,
                                overflow: "hidden",
                                border: "1px solid rgba(0,0,0,0.08)"
                            }}>
                                <PDFViewer width="100%" height="100%" showToolbar={false}>
                                    <PresupuestoPDF {...pdfProps} />
                                </PDFViewer>
                            </Box>
                        )}

                        <Button fullWidth variant="contained" size="large" disabled={loading} onClick={handleEnviar}
                                endIcon={loading ? <CircularProgress size={18} color="inherit"/> : <SendIcon/>}
                                sx={{
                                    py: 1.6,
                                    fontSize: 15,
                                    fontWeight: 800,
                                    borderRadius: 1,
                                    bgcolor: "#1565C0",
                                    color: "#fff",
                                    "&:hover": {bgcolor: "#0D47A1"},
                                    "&:disabled": {bgcolor: "rgba(21,101,192,0.4)", color: "#fff"}
                                }}>
                            {loading ? "Generando y enviando..." : "Generar y Enviar Presupuesto"}
                        </Button>
                    </>
                )}

                {tab === 1 && (
                    <Box>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Si ya tienes el presupuesto listo, puedes subirlo directamente sin generarlo desde aquí.
                        </Typography>

                        <Box component="label" htmlFor="pdf-upload-directo"
                             sx={{
                                 display: "flex",
                                 flexDirection: "column",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 gap: 1.5,
                                 border: "2px dashed",
                                 borderColor: pdfFile ? "#2E7D32" : "#1565C0",
                                 borderRadius: 1,
                                 p: 4,
                                 cursor: "pointer",
                                 bgcolor: pdfFile ? "rgba(46,125,50,0.05)" : "rgba(21,101,192,0.04)",
                                 transition: "all 0.2s",
                                 "&:hover": {bgcolor: "rgba(21,101,192,0.08)"},
                                 mb: 3,
                             }}>
                            <input id="pdf-upload-directo" type="file" accept="application/pdf" hidden
                                   onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}/>
                            {pdfFile ? (
                                <>
                                    <PictureAsPdfIcon sx={{fontSize: 40, color: "#2E7D32"}}/>
                                    <Typography variant="body2" fontWeight={700} color="#2E7D32"
                                                textAlign="center">{pdfFile.name}</Typography>
                                    <Chip label={`${(pdfFile.size / 1024 / 1024).toFixed(2)} MB`} size="small"
                                          sx={{bgcolor: "rgba(46,125,50,0.1)", color: "#2E7D32", fontWeight: 700}}/>
                                    <Typography variant="caption" color="text.secondary">Toca para cambiar</Typography>
                                </>
                            ) : (
                                <>
                                    <UploadFileIcon sx={{fontSize: 40, color: "#1565C0"}}/>
                                    <Typography variant="body2" fontWeight={700} color="#1565C0">Seleccionar
                                        PDF</Typography>
                                    <Typography variant="caption" color="text.secondary">Haz clic o arrastra tu archivo
                                        aquí</Typography>
                                </>
                            )}
                        </Box>

                        <Button fullWidth variant="contained" size="large" disabled={!pdfFile || loadingSubir}
                                onClick={handleSubirPdf}
                                endIcon={loadingSubir ? <CircularProgress size={18} color="inherit"/> : <SendIcon/>}
                                sx={{
                                    py: 1.6,
                                    fontSize: 15,
                                    fontWeight: 800,
                                    borderRadius: 1,
                                    bgcolor: "#1565C0",
                                    color: "#fff",
                                    "&:hover": {bgcolor: "#0D47A1"},
                                    "&:disabled": {bgcolor: "rgba(21,101,192,0.4)", color: "#fff"}
                                }}>
                            {loadingSubir ? "Subiendo..." : "Subir y Enviar"}
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}