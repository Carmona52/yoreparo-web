import {Cotizaciones} from "@/lib/types/cotizaciones";
import {Servicios} from "@/lib/types/servicios";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {requireAuth} from "@/lib/supabase/Auth";
import StatCards from "@/components/dashboard/statsCards";
import CotizacionesRecientes from "@/components/dashboard/cotizacionesRecientes";
import JobsPendientesAsignar from "@/components/dashboard/jobsPendientesAsignar";
import GraficaIngresos from "@/components/dashboard/graficaIngresos";
import {supabase} from "@/lib/supabase/supabase";

export default async function DashboardPage() {

    const {user, profile} = await requireAuth();

    const firstName = profile.name?.split(" ")[0]
        ?? user.email?.split("@")[0]
        ?? "Usuario";

    const [
        {count: serviciosActivos},
        {count: tecnicosTotal},
        {count: cotizacionesPendientes},
        {count: trabajosFinalizados},
        {data: cotizacionesRecientes},
        {data: jobsSinTecnico},
        {data: jobsFinalizados},
    ] = await Promise.all([
        supabase
            .from("jobs")
            .select("*", {count: "exact", head: true})
            .eq("status", "en proceso"),

        supabase
            .from("profiles")
            .select("*", {count: "exact", head: true})
            .neq("role", "cliente"),

        supabase
            .from("cotizaciones")
            .select("*", {count: "exact", head: true})
            .ilike("estado", "pendiente"),

        supabase
            .from("jobs")
            .select("*", {count: "exact", head: true})
            .ilike("status", "Finalizado"),

        supabase
            .from("cotizaciones")
            .select("*")
            .order("created_at", {ascending: false})
            .limit(8),

        supabase
            .from("jobs")
            .select("*")
            .is("worker_id", null)
            .order("created_at", {ascending: false})
            .limit(8),

        supabase
            .from("jobs")
            .select("id, title, price, fecha_cita, status")
            .ilike("status", "Finalizado")
            .not("price", "is", null)
            .order("fecha_cita", {ascending: false}),
    ]);

    return (
        <Box>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" gutterBottom sx={{
                    fontWeight: 800
                }}>
                    Hola, {firstName} 👋
                </Typography>
                <Typography variant="body2" sx={{
                    color: "text.secondary"
                }}>
                    Aquí está el resumen del día
                </Typography>
            </Box>
            <StatCards
                serviciosActivos={serviciosActivos ?? 0}
                tecnicosTotal={tecnicosTotal ?? 0}
                cotizacionesPendientes={cotizacionesPendientes ?? 0}
                trabajosFinalizados={trabajosFinalizados ?? 0}
            />
            <Grid container spacing={2.5}>
                <Grid size={{xs: 12, md: 6}}>
                    <CotizacionesRecientes cotizaciones={(cotizacionesRecientes ?? []) as Cotizaciones[]}/>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <JobsPendientesAsignar jobs={(jobsSinTecnico ?? []) as Servicios[]}/>
                </Grid>
            </Grid>
            <Box sx={{my: 3}}>
                <GraficaIngresos jobs={(jobsFinalizados ?? []) as Servicios[]}/>
            </Box>
        </Box>
    );
}