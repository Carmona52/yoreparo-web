import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import {User} from "@/lib/types/user";

type Stat = { label: string; value: number; color: string; bg: string };

type Props = {
    tecnico: User;
    stats: Stat[];
};

export default function TecnicoPerfil({tecnico, stats}: Props) {
    return (
        <Card sx={{borderRadius: 4, border: "1px solid rgba(0,0,0,0.07)", mb: 3, overflow: "hidden"}}>
            <Box sx={{bgcolor: "#1A1A2E", height: 64}}/>
            <CardContent sx={{pt: 0, px: 3, pb: "24px !important"}}>
                <Box sx={{display: "flex", alignItems: "flex-end", gap: 2, mt: "-36px", mb: 2}}>
                    <Avatar sx={{
                        width: 72, height: 72,
                        bgcolor: "#FFD600", color: "#1A1A2E",
                        fontWeight: 900, fontSize: 28,
                        border: "4px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}>
                        {tecnico.name?.charAt(0).toUpperCase() ?? "T"}
                    </Avatar>
                    <Box sx={{pb: 0.5}}>
                        <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                            {tecnico.name}
                        </Typography>
                        <Chip
                            label={tecnico.role} size="small"
                            sx={{
                                mt: 0.5,
                                height: 22,
                                fontSize: 11,
                                fontWeight: 700,
                                bgcolor: "rgba(255,214,0,0.15)",
                                color: "#B8860B"
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{display: "flex", flexDirection: "column", gap: 1, mb: 2}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <PhoneIcon sx={{fontSize: 15, color: "#5A5A72"}}/>
                        <Typography variant="body2" color="text.secondary">{tecnico.phone ?? "—"}</Typography>
                    </Box>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <EmailIcon sx={{fontSize: 15, color: "#5A5A72"}}/>
                        <Typography variant="body2" color="text.secondary">{tecnico.email ?? "—"}</Typography>
                    </Box>
                </Box>

                <Divider sx={{mb: 2}}/>

                <Grid container spacing={1.5}>
                    {stats.map((s) => (
                        <Grid key={s.label} size={{xs: 6, sm: 3}}>
                            <Box sx={{textAlign: "center", bgcolor: s.bg, borderRadius: 2.5, py: 1.5}}>
                                <Typography variant="h5" fontWeight={800} color={s.color}>{s.value}</Typography>
                                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}