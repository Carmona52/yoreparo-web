"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LightIcon from '@mui/icons-material/Light';
import Button from "@mui/material/Button";
import HardwareIcon from '@mui/icons-material/Hardware';
import HandymanIcon from '@mui/icons-material/Handyman';
import ReportIcon from '@mui/icons-material/Report';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Container from "@mui/material/Container";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import Navbar from "@/components/home/NavBar";
import Footer from "@/components/home/Footer";
import yoReparoTitle from '@/public/Yoreparo1024.png';
import trabajador from '@/public/trabajador.png';



export default function HomePage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [activeStep, setActiveStep] = useState(0);


    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setActiveStep(p => (p + 1) % 6), 2400);
        return () => clearInterval(t);
    }, []);

    const pasos = [
        {num: "01", titulo: "Solicitud", desc: "Describe el problema y sube fotos desde la app."},
        {num: "02", titulo: "Diagnóstico", desc: "Análisis técnico detallado en menos de 24h."},
        {num: "03", titulo: "Cotización", desc: "Presupuesto claro sin costos ocultos."},
        {num: "04", titulo: "Aprobación", desc: "Autorizas el servicio con un toque."},
        {num: "05", titulo: "Reparación", desc: "Técnicos certificados con piezas de calidad."},
        {num: "06", titulo: "Garantía", desc: "Entrega verificada y seguimiento incluido."},
    ];

    const servicios = [
        {
            icono: (
                <Box sx={{bgcolor: "#E3F2FD", borderRadius: "50%", p: 1.5, display: "inline-flex",}}>
                    <WaterDropIcon sx={{color: "#1976D2", fontSize: 32}}/>
                </Box>
            ),
            titulo: "Plomería",
            sub: "Fugas, instalaciones y mantenimiento",
        },
        {
            icono: (
                <Box sx={{bgcolor: "#FFF3E0", borderRadius: "50%", p: 1.5, display: "inline-flex",}}>
                    <LightIcon sx={{color: "#F57C00", fontSize: 32}}/>
                </Box>
            ),
            titulo: "Eléctrico",
            sub: "Instalaciones, cortos y tableros",
        },
        {
            icono: (
                <Box sx={{bgcolor: "#E8F5E9", borderRadius: "50%", p: 1.5, display: "inline-flex",}}>
                    <HardwareIcon sx={{color: "#2E7D32", fontSize: 32}}/>
                </Box>
            ),
            titulo: "Albañilería",
            sub: "Acabados, pisos y remodelaciones",
        },
        {
            icono: (
                <Box sx={{bgcolor: "#E1F5FE", borderRadius: "50%", p: 1.5, display: "inline-flex",}}>
                    <AcUnitIcon sx={{color: "#0288D1", fontSize: 32}}/>
                </Box>
            ),
            titulo: "Climatización",
            sub: "A/C, calentadores y electrodomésticos",
        },
        {
            icono: (
                <Box sx={{bgcolor: "#F3E5F5", borderRadius: "50%", p: 1.5, display: "inline-flex",}}>
                    <HandymanIcon sx={{color: "#7B1FA2", fontSize: 32}}/>
                </Box>
            ),
            titulo: "Mantenimiento",
            sub: "Preventivo y correctivo general",
        },
        {
            icono: (
                <Box sx={{bgcolor: "#FFEBEE", borderRadius: "50%",p: 1.5,display: "inline-flex",}}>
                    <ReportIcon sx={{color: "#D32F2F", fontSize: 32}}/>
                </Box>
            ),
            titulo: "Emergencias",
            sub: "Atención prioritaria 24/7",
        },
    ];

    const porques = [
        {
            icon: <SpeedIcon sx={{color: "#1976D2"}}/>,
            t: "Diagnóstico en 24h",
            d: "Te decimos exactamente qué tiene tu equipo y cuánto cuesta arreglarlo."
        },
        {
            icon: <SecurityIcon sx={{color: "#1976D2"}}/>,
            t: "Precios transparentes",
            d: "Cotización clara. Sin sorpresas ni costos ocultos al momento de pagar."
        },
        {
            icon: <SupportAgentIcon sx={{color: "#1976D2"}}/>,
            t: "Seguimiento en vivo",
            d: "Sigue tu reparación en tiempo real desde la app. Sin llamadas innecesarias."
        },
        {
            icon: <CheckCircleOutlineOutlinedIcon sx={{color: "#1976D2"}}/>,
            t: "Garantía incluida",
            d: "Si falla de nuevo dentro del período de garantía, regresamos sin costo."
        },
        {
            icon: <PhoneInTalkIcon sx={{color: "#1976D2"}}/>,
            t: "Atención 24/7",
            d: "Para emergencias, atención prioritaria el mismo día que nos contactes."
        },
        {
            icon: <ArrowForwardIcon sx={{color: "#1976D2"}}/>,
            t: "Técnicos certificados",
            d: "Personal capacitado, uniformado e identificado en cada visita a tu hogar."
        },
    ];

    const testimonios = [
        {
            nombre: "María González",
            rol: "Cliente frecuente",
            ini: "MG",
            rating: 5,
            texto: "Increíble servicio. Mi instalación eléctrica quedó perfecta y el seguimiento en la app es muy cómodo. Sin sorpresas en el precio."
        },
        {
            nombre: "Carlos Méndez",
            rol: "Propietario",
            ini: "CM",
            rating: 5,
            texto: "Transparencia total en la cotización. Llegaron a tiempo y el precio fue exactamente el acordado. 100% recomendado."
        },
        {
            nombre: "Laura Fernández",
            rol: "Diseñadora",
            ini: "LF",
            rating: 5,
            texto: "Rápidos y muy profesionales. El técnico explicó todo antes de empezar. La plataforma es muy fácil de usar."
        },
    ];

    return (
        <div>
            <Navbar/>
            {/* ── HERO ── */}
            <section
                className=" relative w-screen  flex items-center overflow-hidden bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1976D2]">
                {/* Patrón de puntos */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "32px 32px"
                }}/>
                {/* Círculo decorativo */}
                <div
                    className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full bg-white/5 border border-white/10"/>
                <div
                    className="absolute -right-16 -top-16 w-[400px] h-[400px] rounded-full bg-white/5 border border-white/10"/>

                <div className="w-[90%] relative z-10 mt-30 mx-auto">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="flex-2 text-white">
                            <Chip label="Tehuacán, Puebla · Servicios de reparación para el hogar" size="small"
                                  sx={{
                                      bgcolor: "rgba(255,255,255,0.15)",
                                      color: "#fff",
                                      mb: 3,
                                      fontWeight: 500,
                                      letterSpacing: "0.05em"
                                  }}
                            />
                            <Image src={yoReparoTitle} alt="YoReparo" className="w-24 h-auto object-contain md:w-96"/>
                            <Typography variant="h1" sx={{
                                fontSize: {xs: "3rem", md: "4.5rem", lg: "5.5rem"},
                                fontWeight: 900, lineHeight: 1,
                                color: "#fff", mb: 3, letterSpacing: "-0.02em",
                            }}>
                                Tu hogar,<span style={{color: "#FFD600"}}> <br/>siempre</span> en forma.
                            </Typography>
                            <Typography sx={{
                                fontSize: 18,
                                color: "rgba(255,255,255,0.75)",
                                mb: 4,
                                lineHeight: 1.75,
                                maxWidth: 480
                            }}>
                                Plomería, electricidad, climatización y más. Cotizaciones transparentes y seguimiento en
                                tiempo real desde tu app.
                            </Typography>

                            <div className="flex flex-wrap gap-3 mb-10">
                                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon/>}
                                        onClick={() => router.push("/auth/login")}
                                        sx={{
                                            bgcolor: "#FFD600",
                                            color: "#0D47A1",
                                            fontWeight: 800,
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            "&:hover": {
                                                bgcolor: "#FFC107",
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 8px 24px rgba(255,214,0,0.4)"
                                            },
                                            transition: "all 0.2s"
                                        }}>
                                    Solicitar servicio
                                </Button>
                                <Button
                                    variant="outlined" size="large"
                                    onClick={() => document.getElementById("proceso")?.scrollIntoView({behavior: "smooth"})}
                                    sx={{
                                        borderColor: "rgba(255,255,255,0.5)",
                                        color: "#fff",
                                        fontWeight: 700,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        "&:hover": {borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)"}
                                    }}
                                >
                                    Cómo funciona
                                </Button>
                            </div>

                        </div>

                        {/* Mascota */}
                        <div className="flex-1 relative flex-shrink-0 flex items-end justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="w-72 h-72 rounded-full bg-white/8 border border-white/10 animate-pulse"/>
                            </div>
                            <Image
                                src={trabajador}
                                alt="Técnico Yo Reparo"
                                width={380}
                                height={460}
                                style={{
                                    objectFit: "contain",
                                    position: "relative",
                                    zIndex: 2,
                                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))"
                                }}
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Wave al fondo */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white"/>
                    </svg>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="bg-white py-8 border-b border-gray-100">
                <Container maxWidth={false} sx={{width: "90%", mx: "auto"}}>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                        {[
                            {v: "2,400+", l: "Reparaciones completadas"},
                            {v: "98%", l: "Clientes satisfechos"},
                            {v: "< 24h", l: "Tiempo de respuesta"},
                            {v: "5 años", l: "En el mercado"},
                        ].map((s, i) => (
                            <div key={i} className="text-center py-6 px-4 group">
                                <p className="text-4xl font-black text-blue-600 group-hover:scale-110 transition-transform">{s.v}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">{s.l}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── SERVICIOS ── */}
            <section id="servicios" className="py-24 bg-gray-50">
                <Box sx={{mx: "auto"}} className='w-[90%]'>
                    <div className="text-center mb-14">
                        <Typography variant="overline"
                                    sx={{color: "#1976D2", fontWeight: 700, letterSpacing: "0.15em"}}>
                            Lo que hacemos
                        </Typography>
                        <Typography variant="h3" sx={{fontWeight: 900, mt: 1, fontSize: {xs: "2.5rem", md: "3rem"}}}>
                            Servicios especializados
                        </Typography>

                        <Typography sx={{color: "text.secondary", mt: 1.5, maxWidth: 500, mx: "auto"}}>
                            Soluciones profesionales para el hogar con técnicos certificados y precios transparentes.
                        </Typography>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {servicios.map((s, i) => (
                            <Card key={i} sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "rgba(0,0,0,0.06)",
                                transition: "all 0.25s",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 12px 32px rgba(25,118,210,0.12)",
                                    borderColor: "rgba(25,118,210,0.2)"
                                }
                            }}>
                                <CardContent sx={{p: 3.5}}>
                                    <div className="text-4xl mb-4">{s.icono}</div>
                                    <Typography variant="h6" sx={{fontWeight: 800, mb: 0.5}}>{s.titulo}</Typography>
                                    <Typography variant="body2"
                                                sx={{color: "text.secondary", lineHeight: 1.7}}>{s.sub}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Box>
            </section>

            {/* ── PROCESO ── */}
            <section id="proceso" className="py-24 bg-white">
                <Container maxWidth={false} sx={{width: "90%", mx: "auto"}}>
                    <div className="text-center mb-14">
                        <Typography variant="overline"
                                    sx={{color: "#1976D2", fontWeight: 700, letterSpacing: "0.15em"}}>
                            Flujo de trabajo
                        </Typography>
                        <Typography variant="h3" sx={{fontWeight: 900, mt: 1, color: "#1A1A2E"}}>
                            De la solicitud a la entrega
                        </Typography>
                    </div>
                    <div
                        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-0 border border-gray-100 rounded-2xl overflow-hidden">
                        {pasos.map((p, i) => (
                            <div key={i} onMouseEnter={() => setActiveStep(i)}
                                 className={`p-6 border-r border-gray-100 last:border-r-0 cursor-default transition-all duration-300 relative${activeStep === i ? "bg-blue-50" : "bg-white hover:bg-gray-50"}`}>
                                {activeStep === i && (
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600"/>)}
                                <p className={`text font-bold tracking-widest mb-3 transition-colors ${activeStep === i ? "text-blue-600" : "text-gray-300"}`}>
                                    {p.num}
                                </p>
                                <p className="font-black text-xl uppercase tracking-wide text-gray-900 mb-2">
                                    {p.titulo}
                                </p>
                                <p className={`text-lg leading-relaxed transition-colors ${activeStep === i ? "text-gray-600" : "text-gray-400"}`}>
                                    {p.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── POR QUÉ ── */}
            <section id="nosotros" className="py-24 bg-blue-600">
                <Container maxWidth={false} sx={{width: "90%", mx: "auto"}}>
                    <div className="text-center mb-14">
                        <Typography variant="overline"
                                    sx={{color: "rgba(255,255,255,0.6)", fontWeight: 700, letterSpacing: "0.15em"}}>Por
                            qué elegirnos</Typography>
                        <Typography variant="h3" sx={{fontWeight: 900, mt: 1, color: "#fff"}}>La diferencia Yo
                            Reparo</Typography>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {porques.map((item, i) => (
                            <div key={i}
                                 className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1">
                                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <p className="font-black text-white text-base uppercase tracking-wide mb-2">{item.t}</p>
                                <p className="text-white/60 text-sm leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── TESTIMONIOS ── */}
            <section className="py-24 bg-gray-50">
                <Container maxWidth={false} sx={{width: "90%", mx: "auto"}}>
                    <div className="text-center mb-14">
                        <Typography variant="overline"
                                    sx={{color: "#1976D2", fontWeight: 700, letterSpacing: "0.15em"}}>Clientes
                            reales</Typography>
                        <Typography variant="h3" sx={{fontWeight: 900, mt: 1, color: "#1A1A2E"}}>Lo que dicen de
                            nosotros</Typography>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonios.map((t, i) => (
                            <Card key={i} sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "rgba(0,0,0,0.06)",
                                transition: "all 0.25s",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                    boxShadow: "0 12px 32px rgba(25,118,210,0.1)",
                                    borderColor: "rgba(25,118,210,0.2)"
                                }
                            }}>
                                <CardContent sx={{p: 3.5}}>
                                    <Rating value={t.rating} readOnly size="small" sx={{mb: 2, color: "#1976D2"}}/>
                                    <Typography variant="body2" sx={{
                                        color: "text.secondary",
                                        lineHeight: 1.8,
                                        mb: 3,
                                        fontStyle: "italic"
                                    }}>
                                        {t.texto}
                                    </Typography>
                                    <div className="flex items-center gap-3">
                                        <Avatar sx={{
                                            bgcolor: "rgba(25,118,210,0.12)",
                                            color: "#1976D2",
                                            fontWeight: 900,
                                            fontSize: 14,
                                            width: 38,
                                            height: 38,
                                            borderRadius: 1.5
                                        }}>
                                            {t.ini}
                                        </Avatar>
                                        <div>
                                            <Typography variant="subtitle2"
                                                        sx={{fontWeight: 800, fontSize: 13}}>{t.nombre}</Typography>
                                            <Typography variant="caption"
                                                        sx={{color: "text.secondary"}}>{t.rol}</Typography>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Container>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 bg-gradient-to-br from-[#0D47A1] to-[#1976D2] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                     style={{
                         backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                         backgroundSize: "28px 28px"
                     }}
                />
                <div className="absolute -left-32 -bottom-32 w-80 h-80 rounded-full bg-white/5 border border-white/10"/>
                <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-white/5 border border-white/10"/>
                <Container maxWidth={false}
                           sx={{width: "90%", mx: "auto", position: "relative", zIndex: 2, textAlign: "center"}}>
                    <Chip label="Empieza hoy" size="small"
                          sx={{bgcolor: "rgba(255,255,255,0.15)", color: "#fff", mb: 3, fontWeight: 600}}/>
                    <Typography variant="h2" sx={{
                        fontWeight: 900,
                        color: "#fff",
                        mb: 2,
                        fontSize: {xs: "2.5rem", md: "4rem"},
                        lineHeight: 1.1
                    }}>
                        ¿Listo para<br/>
                        <span style={{color: "#FFD600"}}>repararlo?</span>
                    </Typography>
                    <Typography sx={{color: "rgba(255,255,255,0.65)", mb: 5, fontSize: 17, lineHeight: 1.75}}>
                        Crea tu cuenta, describe el problema y recibe una cotización sin compromiso en menos de 24
                        horas.
                    </Typography>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button variant="contained" size="large" onClick={() => router.push("/auth/login")}
                                endIcon={<ArrowForwardIcon/>}
                                sx={{
                                    bgcolor: "#FFD600",
                                    color: "#0D47A1",
                                    fontWeight: 800,
                                    px: 5,
                                    py: 1.8,
                                    borderRadius: 2,
                                    fontSize: 16,
                                    "&:hover": {
                                        bgcolor: "#FFC107",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 8px 24px rgba(255,214,0,0.4)"
                                    },
                                    transition: "all 0.2s"
                                }}>
                            Solicitar servicio
                        </Button>
                        <Button variant="outlined" size="large" onClick={() => router.push("/auth/register")}
                                sx={{
                                    borderColor: "rgba(255,255,255,0.4)",
                                    color: "#fff",
                                    fontWeight: 700,
                                    px: 5,
                                    py: 1.8,
                                    borderRadius: 2,
                                    fontSize: 16,
                                    "&:hover": {borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)"}
                                }}>
                            Crear cuenta gratis
                        </Button>
                    </div>
                </Container>
            </section>
            <Footer/>
        </div>
    );
}