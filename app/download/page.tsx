"use client";

import {useState} from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import AndroidIcon from "@mui/icons-material/Android";
import DownloadIcon from "@mui/icons-material/Download";
import SecurityIcon from "@mui/icons-material/Security";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const APK_URL =
    "https://github.com/Carmona52/yoreparo-web/releases/download/App_movil/application-e5cd2aa6-cae2-4310-b7df-5f5fa7f87cfd.apk";

const APK_VERSION = "1.0.0";
const APK_SIZE = "120 MB";

const steps = [
    {
        icon: <InfoOutlinedIcon sx={{fontSize: 20, color: "#F57C00"}}/>,
        text: 'Abre Ajustes → Seguridad → activa "Instalar apps desconocidas"',
    },
    {
        icon: <DownloadIcon sx={{fontSize: 20, color: "#1565C0"}}/>,
        text: "Descarga el archivo APK y ábrelo desde tu carpeta de Descargas",
    },
    {
        icon: <CheckCircleOutlineIcon sx={{fontSize: 20, color: "#2E7D32"}}/>,
        text: "Toca Instalar y espera a que finalice. ¡Listo!",
    },
];

export default function DownloadPage() {
    const [downloading, setDownloading] = useState(false);
    const [done, setDone] = useState(false);

    function handleDownload() {
        setDownloading(true);
        setDone(false);

        const a = document.createElement("a");
        a.href = APK_URL;
        a.download = "YoReparo.apk";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
            setDownloading(false);
            setDone(true);
        }, 2500);
    }

    return (
        <Box sx={{
                minHeight: "100vh",
                bgcolor: "#F5F6FA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: {xs: 2, sm: 4},
            }}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 480,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}>
                <Box
                    sx={{
                        bgcolor: "#fff",
                        borderRadius: 4,
                        border: "1px solid rgba(0,0,0,0.07)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                        overflow: "hidden",
                    }}>
                    <Box
                        sx={{
                            px: 4,
                            py: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        <Image
                            src="/logo.png"
                            alt="Yo Reparo"
                            width={180}
                            height={72}
                            style={{objectFit: "contain"}}
                            priority
                        />
                    </Box>

                    <Box sx={{px: 4, py: 3.5}}>
                        <Box sx={{display: "flex", alignItems: "center", gap: 1.5, mb: 0.5}}>
                            <AndroidIcon sx={{color: "#3DDC84", fontSize: 26}}/>
                            <Typography variant="h5" fontWeight={800} color="text.primary">
                                App para Android
                            </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" mb={2.5}>
                            Descarga la aplicación oficial de Yo Reparo para gestionar tus servicios desde cualquier
                            lugar.
                        </Typography>

                        <Box sx={{display: "flex", gap: 1, flexWrap: "wrap", mb: 3}}>
                            <Chip label={`Versión ${APK_VERSION}`} size="small" sx={{
                                bgcolor: "rgba(255,214,0,0.15)",
                                color: "#B8860B",
                                fontWeight: 700,
                                fontSize: 11
                            }}/>
                            <Chip label={APK_SIZE} size="small"
                                  sx={{bgcolor: "rgba(0,0,0,0.05)", color: "#5A5A72", fontWeight: 600, fontSize: 11}}/>
                            <Chip label="Android 8.0+" size="small" sx={{
                                bgcolor: "rgba(61,220,132,0.12)",
                                color: "#1B6B3A",
                                fontWeight: 600,
                                fontSize: 11
                            }}/>
                        </Box>

                        {downloading && (
                            <Box sx={{mb: 2}}>
                                <LinearProgress
                                    color="warning"
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: "rgba(255,214,0,0.2)",
                                        "& .MuiLinearProgress-bar": {bgcolor: "#FFD600"},
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: "block"}}>
                                    Iniciando descarga...
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleDownload}
                            disabled={downloading}
                            startIcon={done ? <CheckCircleOutlineIcon/> : <DownloadIcon/>}
                            sx={{
                                py: 1.6,
                                fontSize: 16,
                                fontWeight: 800,
                                borderRadius: 3,
                                bgcolor: done ? "#2E7D32" : "#FFD600",
                                color: done ? "#fff" : "#1A1A1A",
                                "&:hover": {
                                    bgcolor: done ? "#1B5E20" : "#F9A800",
                                },
                                "&:disabled": {
                                    bgcolor: "rgba(255,214,0,0.5)",
                                    color: "#1A1A1A",
                                },
                                transition: "background-color 0.3s",
                            }}
                        >
                            {done
                                ? "¡Descarga iniciada!"
                                : downloading
                                    ? "Preparando descarga..."
                                    : "Descargar APK"}
                        </Button>

                        {/* Nota de seguridad */}
                        <Box
                            sx={{
                                mt: 2,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                bgcolor: "rgba(21,101,192,0.06)",
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                            }}
                        >
                            <SecurityIcon sx={{fontSize: 16, color: "#1565C0", mt: 0.2, flexShrink: 0}}/>
                            <Typography variant="caption" color="#1565C0" lineHeight={1.5}>
                                Archivo verificado y seguro. Descarga directamente desde nuestro repositorio oficial en
                                GitHub.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Card de instrucciones */}
                <Box
                    sx={{
                        bgcolor: "#fff",
                        borderRadius: 4,
                        border: "1px solid rgba(0,0,0,0.07)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                        px: 4,
                        py: 3,
                    }}
                >
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={2}>
                        Cómo instalar en Android
                    </Typography>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                        {steps.map((step, i) => (
                            <Box key={i}>
                                <Box sx={{display: "flex", gap: 2, alignItems: "flex-start"}}>
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: "50%",
                                            bgcolor: "#F5F6FA",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            border: "1px solid rgba(0,0,0,0.07)",
                                        }}
                                    >
                                        {step.icon}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" lineHeight={1.6} pt={0.3}>
                                        {step.text}
                                    </Typography>
                                </Box>
                                {i < steps.length - 1 && (
                                    <Divider sx={{mt: 2, borderColor: "rgba(0,0,0,0.05)"}}/>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" textAlign="center">
                    © {new Date().getFullYear()} Yo Reparo · Todos los derechos reservados
                </Typography>
            </Box>
        </Box>
    );
}