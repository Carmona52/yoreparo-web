import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={1}>
                Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
                Bienvenido, {user.email}
            </Typography>

            <Grid container spacing={3}>
                {["Usuarios", "Ventas", "Proyectos", "Reportes"].map((label, i) => (
                    <Grid key={label} size={{xs: 12, sm: 6, lg: 3}}>
                        <Card>
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">
                                    {label}
                                </Typography>
                                <Typography variant="h4" fontWeight={700} mt={1}>
                                    {(i + 1) * 24}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}