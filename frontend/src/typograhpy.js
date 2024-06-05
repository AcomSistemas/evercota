import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

// Colors
export const tokens = () => ({
    grey: {
        100: "#141414",
        500: "#666666",
        700: "#a3a3a3",
        800: "#c2c2c2",
        1100: "#616161",
    },
    primary: {
        400: "#f2f0f0",
    },
    greenAccent: {
        500: '#4cceac'
    },
    redAccent: {
        100: "#2c100f",
        200: "#58201e",
        300: "#832f2c",
        400: "#af3f3b",
        500: "#db4f4a",
        600: "#e2726e",
    },
    blueAccent: {
        100: "#011F3A",
        200: "#2a2d64",
        400: "#535ac8",
        500: "#6870fa",

    },
    custom: {
        'boxShadow': '#44444444',
        'white': '#ffffff',
        'orange': '#EA5C11',
        'rubaiyat': '#B62626',
        'greenAlert': '#3da58a',

    }
})

// Mui theme settings
export const themeSettings = () => {
    const colors = tokens()

    return {
        palette: {
            primary: {
                main: colors.grey[100],
                contrastText: colors.primary[900]
            },
            secondary: {
                main: colors.blueAccent[400]
            },
            neutral: {
                main: colors.grey[500],
                light: colors.grey[100]
            },
            background: {
                default: '#fcfcfc'
            }

        },
        typography: {
            fontFamily: ['Montserrat', 'Source Sans 3', 'sans-serif'].join(','),
            fontSize: 12,
            h1: {
                fontFamily: ['Montserrat', 'Source Sans 3', 'sans-serif'].join(','),
                fontSize: 40
            },
            h2: {
                fontFamily: ['Montserrat', 'Source Sans 3', 'sans-serif'].join(','),
                fontSize: 32
            },
            h3: {
                fontFamily: ['Montserrat', 'Source Sans 3', 'sans-serif'].join(','),
                fontSize: 24
            },
            h4: {
                fontFamily: ['Montserrat', 'Source Sans 3', 'sans-serif'].join(','),
                fontSize: 20
            },
            h5: {
                fontFamily: ['Montserrat', 'Source Sans 3', 'sans-serif'].join(','),
                fontSize: 16
            },
            h6: {
                fontFamily: ['Montserrat', 'Source Sans 3', 'sans-serif'].join(','),
                fontSize: 14
            }
        }
    }
}

export const useMode = () => {
    const theme = useMemo(() => createTheme(themeSettings()))

    return [theme]
}