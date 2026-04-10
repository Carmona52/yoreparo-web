import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const stats = [
    {
        label: "Servicios activos",
        value: "48",
        delta: "+12%",
        positive: true,
        icon: <BuildIcon sx={{fontSize: 22, color: "#F57C00"}}/>,
        bg: "rgba(245,124,0,0.08)"
    },
    {
        label: "Técnicos disponibles",
        value: "21",
        delta: "+3",
        positive: true,
        icon: <PeopleIcon sx={{fontSize: 22, color: "#1565C0"}}/>,
        bg: "rgba(21,101,192,0.08)"
    },
    {
        label: "Solicitudes hoy",
        value: "134",
        delta: "+28%",
        positive: true,
        icon: <AssignmentIcon sx={{fontSize: 22, color: "#FFD600"}}/>,
        bg: "rgba(255,214,0,0.12)"
    },
    {
        label: "Completados hoy",
        value: "96",
        delta: "71.6%",
        positive: true,
        icon: <CheckCircleIcon sx={{fontSize: 22, color: "#2E7D32"}}/>,
        bg: "rgba(46,125,50,0.08)"
    },
];

export default async function DashboardPage() {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Usuario";

    return (
        <Box>
            {/* Header */}
            <Box sx={{mb: 4}}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    Hola, {firstName} 👋
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Aquí está el resumen del día
                </Typography>
            </Box>

            {/* Stat cards */}
            <Grid container spacing={2.5} sx={{mb: 4}}>
                {stats.map((s) => (
                    <Grid key={s.label} size={{xs: 12, sm: 6, xl: 3}}>
                        <Card>
                            <CardContent sx={{p: "20px !important"}}>
                                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                                    <Box>
                                        <Typography variant="overline" display="block" mb={0.5}>
                                            {s.label}
                                        </Typography>
                                        <Typography variant="h4" fontWeight={800} color="text.primary" lineHeight={1}>
                                            {s.value}
                                        </Typography>
                                        <Chip
                                            label={s.delta}
                                            size="small"
                                            sx={{
                                                mt: 1,
                                                height: 22,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                backgroundColor: s.positive ? "rgba(46,125,50,0.1)" : "rgba(211,47,47,0.1)",
                                                color: s.positive ? "#2E7D32" : "#C62828",
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{
                                        width: 44, height: 44, borderRadius: 2.5,
                                        backgroundColor: s.bg,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {s.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Placeholder content */}
            <Grid container spacing={2.5}>
                <Grid size={{xs: 12, md: 7}}>
                    <Card>
                        <CardContent sx={{p: "24px !important"}}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Solicitudes recientes
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aquí aparecerán las últimas solicitudes de servicio.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs: 12, md: 5}}>
                    <Card>
                        <CardContent sx={{p: "24px !important"}}>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Técnicos en campo
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Estado en tiempo real de los técnicos activos.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}