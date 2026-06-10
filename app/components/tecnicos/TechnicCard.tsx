'use client';

import { User } from "@/lib/types/user";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { translateRole } from "@/lib/utils/translateRole";

interface TechnicianCardProps {
    tecnico: User;
}

export default function TechnicianCard({ tecnico }: TechnicianCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/dashboard/tecnicos/${tecnico.id}`);
    };

    return (
        <Card>
            <CardActionArea onClick={handleClick}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <Avatar
                            sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                fontWeight: 800,
                                width: 46,
                                height: 46,
                            }}
                        >
                            {tecnico.name?.charAt(0).toUpperCase() ?? "T"}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography noWrap sx={{ fontWeight: 700 }}>
                                {tecnico.name ?? "Sin nombre"}
                            </Typography>
                            <Chip
                                label={translateRole(tecnico.role)}
                                size="small"
                                sx={{
                                    mt: 0.5,
                                    height: 20,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    bgcolor: "rgba(255,214,0,0.15)",
                                    color: "#B8860B",
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography variant="body2" noWrap sx={{ color: "text.secondary" }}>
                                {tecnico.email ?? "—"}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {tecnico.phone ?? "—"}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}