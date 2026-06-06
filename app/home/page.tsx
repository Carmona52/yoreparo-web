"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import Navbar from "@/components/navegacion/navBar";

import Timeline from '@mui/lab/Timeline';
import TimelineItem, {timelineItemClasses} from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    CircularProgress
} from "@mui/material";


import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function HomePage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        async function routeUser() {
            const {data: {session}} = await supabase.auth.getSession();

            if (session) {
                setUsuario(true);
                router.push("/home/user");
            } else {
                setUsuario(false);
            }
        }

        routeUser();
    }, [router]);


    return (
        <Box sx={{minHeight: "100vh", bgcolor: "#f8f9fa", pb: 10, }}>
            <Navbar isLoggedIn={usuario}/>
            <Box sx={{
                bgcolor: "#1A1A2E",
                color: "white",
                py: {xs: 8, md: 12},
                textAlign: "center",

            }}>
                <Container maxWidth="md">
                    <Typography variant="h2" sx={{mb: 3, fontSize: {xs: '2.5rem', md: '3.75rem'}}}>
                        Reparaciones confiables, <br/>
                        <span style={{color: "#EF9F9F"}}>sin complicaciones.</span>
                    </Typography>
                    <Typography variant="h6" sx={{mb: 4, color: "rgba(255,255,255,0.8)", fontWeight: 400}}>
                        Gestiona tus cotizaciones, aprueba servicios y dale seguimiento
                        a tus reparaciones desde un solo lugar.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => router.push("/auth/login")}
                        sx={{
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                        }}
                    >
                        Comenzar ahora
                    </Button>
                </Container>
            </Box>
            <Container maxWidth="lg" sx={{mt: -5}}>


                <Paper elevation={3} sx={{p: {xs: 3, md: 5}, borderRadius: 3, mb: 8, textAlign: "center"}}>
                    <Typography variant="h4" gutterBottom sx={{
                        color: "#1A1A2E"
                    }}>
                        ¿Quiénes Somos?
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "text.secondary",
                            maxWidth: 700,
                            mx: "auto",
                            fontSize: "1.1rem",
                            lineHeight: 1.8
                        }}>
                        En <strong>Yo Reparo</strong> somos un equipo de expertos dedicados a devolverle la vida a tus
                        equipos.
                        Nuestra misión es ofrecer total transparencia en cada diagnóstico y reparación.
                        No más sorpresas en los precios ni retrasos inexplicables: tú tienes el control
                        y la visibilidad de todo el proceso a través de nuestra plataforma.
                    </Typography>
                </Paper>

                <Box sx={{textAlign: "center", mb: 6}}>
                    <Typography variant="h4" gutterBottom sx={{
                        color: "#1A1A2E"
                    }}>
                        Nuestro Proceso
                    </Typography>
                    <Typography variant="body1" sx={{
                        color: "text.secondary"
                    }}>
                        Así de fácil es trabajar con nosotros
                    </Typography>
                </Box>

                <Timeline
                    sx={{

                        [`& .${timelineItemClasses.root}:before`]: {
                            flex: 0,
                            padding: 0,
                        },
                        maxWidth: 600,
                        mx: "auto",
                    }}>

                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot sx={{bgcolor: "#1A1A2E", p: 1.5, boxShadow: 2}}>
                                <AssignmentIcon sx={{color: "white", fontSize: 28}}/>
                            </TimelineDot>
                            <TimelineConnector sx={{bgcolor: "#1A1A2E", width: 3}}/>
                        </TimelineSeparator>
                        <TimelineContent sx={{py: '18px', px: 3}}>
                            <Typography variant="h6" sx={{
                                color: "#1A1A2E"
                            }}>
                                1. Solicitud y Cotización
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
                                    mt: 0.5,
                                    fontSize: "1rem"
                                }}>
                                Ingresas el equipo y generamos un diagnóstico inicial con una cotización clara para que
                                tú decidas.
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot sx={{bgcolor: "#1A1A2E", p: 1.5, boxShadow: 2}}>
                                <BuildIcon sx={{color: "white", fontSize: 28}}/>
                            </TimelineDot>
                            <TimelineConnector sx={{bgcolor: "#1A1A2E", width: 3}}/>
                        </TimelineSeparator>
                        <TimelineContent sx={{py: '18px', px: 3}}>
                            <Typography variant="h6" sx={{
                                color: "#1A1A2E"
                            }}>
                                2. Reparación
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
                                    mt: 0.5,
                                    fontSize: "1rem"
                                }}>
                                Una vez que apruebas la cotización, nuestros técnicos se ponen manos a la obra.
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>

                    <TimelineItem>
                        <TimelineSeparator>
                            <TimelineDot sx={{bgcolor: "#d32f2f", p: 1.5, boxShadow: 2}}>
                                <CheckCircleIcon sx={{color: "white", fontSize: 28}}/>
                            </TimelineDot>
                        </TimelineSeparator>
                        <TimelineContent sx={{py: '18px', px: 3}}>
                            <Typography variant="h6" component='h6' sx={{
                                color: "#d32f2f"
                            }}>
                                3. Entrega
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
                                    mt: 0.5,
                                    fontSize: "1rem"
                                }}>
                                Te notificamos cuando tu equipo está listo para que vuelvas a disfrutar de él como
                                nuevo.
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => router.push("/auth/login")}
                        sx={{
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            my:2
                        }}
                    >
                        Comenzar ahora
                    </Button>
                </Timeline>

            </Container>
        </Box>
    );
}