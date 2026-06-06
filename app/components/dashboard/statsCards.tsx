import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type Props = {
    serviciosActivos: number;
    tecnicosTotal: number;
    cotizacionesPendientes: number;
    trabajosFinalizados: number;
};

export default function StatCards({ serviciosActivos, tecnicosTotal, cotizacionesPendientes, trabajosFinalizados }: Props) {
    const stats = [
        {
            label: "Servicios activos",
            value: serviciosActivos,
            icon: <BuildIcon sx={{ fontSize: 22, color: "#F57C00" }} />,
            bg: "rgba(245,124,0,0.08)",
            chip: { label: "En curso", color: "#E65100", bg: "rgba(245,124,0,0.12)" },
        },
        {
            label: "Técnicos registrados",
            value: tecnicosTotal,
            icon: <PeopleIcon sx={{ fontSize: 22, color: "#1565C0" }} />,
            bg: "rgba(21,101,192,0.08)",
            chip: { label: "Total", color: "#1565C0", bg: "rgba(21,101,192,0.12)" },
        },
        {
            label: "Cotizaciones pendientes",
            value: cotizacionesPendientes,
            icon: <AssignmentIcon sx={{ fontSize: 22, color: "#B8860B" }} />,
            bg: "rgba(255,214,0,0.12)",
            chip: { label: "Sin respuesta", color: "#B8860B", bg: "rgba(255,214,0,0.18)" },
        },
        {
            label: "Trabajos finalizados",
            value: trabajosFinalizados,
            icon: <CheckCircleIcon sx={{ fontSize: 22, color: "#2E7D32" }} />,
            bg: "rgba(46,125,50,0.08)",
            chip: { label: "Completados", color: "#2E7D32", bg: "rgba(46,125,50,0.12)" },
        },
    ];

    return (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {stats.map((s) => (
                <Grid key={s.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <Card>
                        <CardContent sx={{ p: "20px !important" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                    <Typography
                                        variant="overline"
                                        sx={{
                                            display: "block",
                                            mb: 0.5
                                        }}>{s.label}</Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            color: "text.primary",
                                            lineHeight: 1
                                        }}>
                                        {s.value}
                                    </Typography>
                                    <Chip label={s.chip.label} size="small"
                                          sx={{ mt: 1, height: 22, fontSize: 11, fontWeight: 700, bgcolor: s.chip.bg, color: s.chip.color }} />
                                </Box>
                                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {s.icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}