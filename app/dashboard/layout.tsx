"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const DRAWER_FULL = 256;
const DRAWER_MINI = 68;

const navItems = [
    { label: "Dashboard",      icon: <DashboardIcon />,  href: "/dashboard" },
    { label: "Servicios",      icon: <BuildIcon />,       href: "/dashboard/servicios" },
    { label: "Técnicos",       icon: <PeopleIcon />,      href: "/dashboard/tecnicos" },
    { label: "Solicitudes",    icon: <AssignmentIcon />,  href: "/dashboard/solicitudes" },
    { label: "Reportes",       icon: <BarChartIcon />,    href: "/dashboard/reportes" },
];

const bottomItems = [
    { label: "Configuración",  icon: <SettingsIcon />,   href: "/dashboard/configuracion" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const drawerWidth = collapsed && !isMobile ? DRAWER_MINI : DRAWER_FULL;

    async function handleLogout() {
        await supabase.auth.signOut();
        router.replace("/auth/login");
    }

    function NavItem({ item }: { item: typeof navItems[0] }) {
        const isActive = pathname === item.href;
        const mini = collapsed && !isMobile;
        return (
            <ListItem disablePadding sx={{ px: 1, mb: 0.5 }}>
                <Tooltip title={mini ? item.label : ""} placement="right">
                    <ListItemButton
                        selected={isActive}
                        onClick={() => {
                            router.push(item.href);
                            if (isMobile) setMobileOpen(false);
                        }}
                        sx={{ justifyContent: mini ? "center" : "flex-start", minHeight: 46, px: mini ? 1 : 2 }}
                    >
                        <ListItemIcon sx={{ minWidth: mini ? 0 : 38, color: isActive ? "#1A1A2E" : "rgba(255,255,255,0.6)" }}>
                            {item.icon}
                        </ListItemIcon>
                        {!mini && (
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? "#1A1A2E" : "rgba(255,255,255,0.85)" }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
            </ListItem>
        );
    }

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header del drawer */}
            <Toolbar sx={{
                minHeight: "64px !important",
                px: collapsed && !isMobile ? 1 : 2,
                justifyContent: collapsed && !isMobile ? "center" : "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
                {(!collapsed || isMobile) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        {/* Logo mark — círculo amarillo con Y */}
                        <Box sx={{
                            width: 34, height: 34, borderRadius: "50%",
                            backgroundColor: "#FFD600",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 900, fontSize: 16, color: "#1A1A2E",
                            fontFamily: "var(--font-geist-sans), sans-serif",
                            flexShrink: 0,
                        }}>
                            YR
                        </Box>
                        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                            Yo Reparo
                        </Typography>
                    </Box>
                )}
                {collapsed && !isMobile && (
                    <Box sx={{
                        width: 34, height: 34, borderRadius: "50%",
                        backgroundColor: "#FFD600",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 900, fontSize: 14, color: "#1A1A2E",
                    }}>
                        YR
                    </Box>
                )}
                {!isMobile && (
                    <Tooltip title={collapsed ? "Expandir" : "Colapsar"} placement="right">
                        <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ color: "rgba(255,255,255,0.5)", ml: collapsed ? 0 : 1 }}>
                            <ChevronLeftIcon sx={{ transition: "transform 0.2s", transform: collapsed ? "rotate(180deg)" : "none", fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Toolbar>

            {/* Nav principal */}
            <List sx={{ flex: 1, pt: 1.5, px: 0.5 }}>
                {navItems.map((item) => <NavItem key={item.href} item={item} />)}
            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {/* Nav inferior */}
            <List sx={{ pt: 1, pb: 1, px: 0.5 }}>
                {bottomItems.map((item) => <NavItem key={item.href} item={item} />)}

                {/* Logout */}
                <ListItem disablePadding sx={{ px: 1, mt: 0.5 }}>
                    <Tooltip title={collapsed && !isMobile ? "Cerrar sesión" : ""} placement="right">
                        <ListItemButton
                            onClick={handleLogout}
                            sx={{
                                justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                                minHeight: 46,
                                px: collapsed && !isMobile ? 1 : 2,
                                borderRadius: 2,
                                "&:hover": { backgroundColor: "rgba(211,47,47,0.18)" },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 38, color: "#EF9F9F" }}>
                                <LogoutIcon />
                            </ListItemIcon>
                            {(!collapsed || isMobile) && (
                                <ListItemText
                                    primary="Cerrar sesión"
                                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500, color: "#EF9F9F" }}
                                />
                            )}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>

            {/* AppBar solo en móvil */}
            <AppBar position="fixed" elevation={0} sx={{ display: { md: "none" }, zIndex: (t) => t.zIndex.drawer + 1 }}>
                <Toolbar sx={{ gap: 2 }}>
                    <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: "#1A1A2E" }}>
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: "#FFD600", fontSize: 12, fontWeight: 900, color: "#1A1A2E" }}>YR</Avatar>
                        <Typography variant="h6" fontWeight={700} fontSize={15} color="#1A1A2E">Yo Reparo</Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer móvil */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { width: DRAWER_FULL, boxSizing: "border-box" },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Drawer desktop permanente */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", md: "block" },
                    width: drawerWidth,
                    flexShrink: 0,
                    transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
                        overflowX: "hidden",
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>

            {/* Contenido principal */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 3.5 },
                    mt: { xs: "64px", md: 0 },
                    minHeight: "100vh",
                    maxWidth: "100%",
                    overflow: "hidden",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}