'use client';
import {createTheme} from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#FFD600",
            dark: "#F9A800",
            contrastText: "#1A1A1A",
        },
        secondary: {
            main: "#1565C0",
            contrastText: "#ffffff",
        },
        error: {main: "#D32F2F"},
        warning: {main: "#F57C00"},
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
        fontSize: 14,
        h4: {fontWeight: 700, color: "#1A1A2E"},
        h5: {fontWeight: 700, color: "#1A1A2E"},
        h6: {fontWeight: 700, color: "#1A1A2E"},
        subtitle1: {color: "#5A5A72"},
        body2: {color: "#5A5A72"},
        overline: {letterSpacing: "0.1em", fontWeight: 600, color: "#5A5A72"},
    },
    shape: {borderRadius: 12},
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {backgroundColor: "#F5F6FA"},
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 10,
                    boxShadow: "none",
                    "&:hover": {boxShadow: "none"},
                },
                containedPrimary: {
                    backgroundColor: "#FFD600",
                    color: "#1A1A1A",
                    "&:hover": {backgroundColor: "#F9A800"},
                },
                outlinedPrimary: {
                    borderColor: "#FFD600",
                    color: "#1A1A1A",
                    "&:hover": {backgroundColor: "rgba(255,214,0,0.08)"},
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
                        backgroundColor: "#FFD600",
                        color: "#1A1A2E",
                        "& .MuiListItemIcon-root": {color: "#1A1A2E"},
                        "& .MuiListItemText-primary": {color: "#1A1A2E", fontWeight: 700},
                        "&:hover": {backgroundColor: "#F9A800"},
                    },
                    "&:hover": {backgroundColor: "rgba(255,214,0,0.12)"},
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 10,
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#FFD600",
                            borderWidth: 2,
                        },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {color: "#F57C00"},
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {borderRadius: 8},
                colorPrimary: {
                    backgroundColor: "rgba(255,214,0,0.15)",
                    color: "#B8860B",
                },
            },
        },
    },
});