'use client';
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1976D2",
            dark: "#115293",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#1565C0",
            contrastText: "#ffffff",
        },
        error: { main: "#D32F2F" },
        warning: { main: "#F57C00" },
        background: {
            default: "#F5F6FA",
            paper: "#FFFFFF",
        },
        text: {
            primary: "#1A1A2E",
            secondary: "#5A5A72",
        },
        divider: "rgba(0,0,0,0.08)",
    },
    typography: {
        fontFamily: "var(--font-geist-sans), sans-serif",
        fontSize: 16,
        h4: { fontWeight: 700, color: "#1A1A2E" },
        h5: { fontWeight: 700, color: "#1A1A2E" },
        h6: { fontWeight: 700, color: "#1A1A2E" },
        subtitle1: { color: "#5A5A72" },
        body2: { color: "#5A5A72" },
        overline: { letterSpacing: "0.1em", fontWeight: 600, color: "#5A5A72" },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: "#F5F6FA" },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 10,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                    "&.MuiButton-containedPrimary": {
                        backgroundColor: "#1976D2",
                        color: "#ffffff",
                        "&:hover": { backgroundColor: "#115293" },
                    },
                    "&.MuiButton-outlinedPrimary": {
                        borderColor: "#1976D2",
                        color: "#1976D2",
                        "&:hover": { backgroundColor: "rgba(25,118,210,0.08)" },
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                    borderRadius: 16,
                    border: "1px solid rgba(0,0,0,0.06)",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#1A1A2E",
                    borderRight: "none",
                    color: "#fff",
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: "#FFFFFF",
                    color: "#1A1A2E",
                    boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    "&.Mui-selected": {
                        backgroundColor: "#1976D2",
                        color: "#ffffff",
                        "& .MuiListItemIcon-root": { color: "#ffffff" },
                        "& .MuiListItemText-primary": { color: "#ffffff", fontWeight: 700 },
                        "&:hover": { backgroundColor: "#115293" },
                    },
                    "&:hover": { backgroundColor: "rgba(25,118,210,0.12)" },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 10,
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1976D2",
                            borderWidth: 2,
                        },
                    },
                    // El label al enfocar sigue usando el color de warning (naranja) como en el original.
                    // Si quieres que sea azul también, cambia "#F57C00" por "#1976D2"
                    "& .MuiInputLabel-root.Mui-focused": { color: "#1976D2" },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8 },
                colorPrimary: {
                    backgroundColor: "rgba(25,118,210,0.15)",
                    color: "#1976D2",
                },
            },
        },
    },
});