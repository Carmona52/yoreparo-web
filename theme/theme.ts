'use client'
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#000000" },
        secondary: { main: "#ffffff" },
    },
    typography: {
        fontSize: 14,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: "white",
                    color: "Black",
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "white",
                    fontSize: "14px",
                },
            },
        },
    },
});