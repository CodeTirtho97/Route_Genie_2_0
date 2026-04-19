import { Components, Theme } from "@mui/material";

export function getComponents(mode: "dark" | "light"): Components<Theme> {
  const dk = mode === "dark";

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: dk ? "#12100A" : "#FDFAF5",
          color:           dk ? "#FDF6EC" : "#1C1206",
          scrollbarColor:  dk ? "#3D3020 #12100A" : "#C4A882 #F5EFE4",
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": { background: dk ? "#12100A" : "#F5EFE4" },
          "&::-webkit-scrollbar-thumb": {
            background:    dk ? "#3D3020" : "#C4A882",
            borderRadius: 4,
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius:  10,
          padding:       "10px 24px",
          fontWeight:    600,
          transition:    "all 0.2s ease",
        },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: dk
            ? {
                background:  "linear-gradient(135deg, #F59E0B 0%, #E85D26 100%)",
                color:       "#12100A",
                boxShadow:   "0 4px 20px rgba(245,158,11,0.3)",
                "&:hover": {
                  background:  "linear-gradient(135deg, #D97706 0%, #C4431A 100%)",
                  boxShadow:   "0 6px 28px rgba(245,158,11,0.45)",
                  transform:   "translateY(-1px)",
                },
              }
            : {
                background:  "linear-gradient(135deg, #7A4E00 0%, #B84000 100%)",
                color:       "#FDFAF5",
                boxShadow:   "0 4px 20px rgba(122,78,0,0.25)",
                "&:hover": {
                  background:  "linear-gradient(135deg, #5C3A00 0%, #9A3200 100%)",
                  boxShadow:   "0 6px 28px rgba(122,78,0,0.4)",
                  transform:   "translateY(-1px)",
                },
              },
        },
        {
          props: { variant: "outlined", color: "primary" },
          style: dk
            ? {
                borderColor: "#F59E0B",
                color:       "#F59E0B",
                "&:hover": { backgroundColor: "rgba(245,158,11,0.08)", borderColor: "#F59E0B" },
              }
            : {
                borderColor: "#7A4E00",
                color:       "#7A4E00",
                "&:hover": { backgroundColor: "rgba(122,78,0,0.06)", borderColor: "#7A4E00" },
              },
        },
      ],
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: dk ? "#1C1710" : "#F5EFE4",
          border:          dk ? "1px solid #2E2418" : "1px solid rgba(0,0,0,0.08)",
          borderRadius:    16,
          transition:      "all 0.25s ease",
          "&:hover": dk
            ? {
                borderColor: "rgba(245,158,11,0.3)",
                background:  "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(232,93,38,0.03) 100%)",
                boxShadow:   "0 10px 40px rgba(0,0,0,0.5)",
              }
            : {
                borderColor: "rgba(122,78,0,0.25)",
                background:  "linear-gradient(135deg, rgba(122,78,0,0.04) 0%, rgba(184,64,0,0.02) 100%)",
                boxShadow:   "0 10px 40px rgba(0,0,0,0.12)",
              },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: dk ? "#1C1710" : "#F5EFE4",
          backgroundImage: "none",
        },
        elevation1: { boxShadow: dk ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.1)" },
        elevation2: { boxShadow: dk ? "0 10px 40px rgba(0,0,0,0.5)" : "0 10px 40px rgba(0,0,0,0.15)" },
      },
    },

    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: dk ? "#0D0B08" : "#EDE8DF",
            borderRadius:    10,
            "& fieldset": {
              borderColor: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.18)",
            },
            "&:hover fieldset": {
              borderColor: dk ? "rgba(245,158,11,0.5)" : "rgba(122,78,0,0.45)",
            },
            "&.Mui-focused fieldset": {
              borderColor: dk ? "#F59E0B" : "#7A4E00",
              borderWidth: "1.5px",
              boxShadow:   dk
                ? "0 0 0 3px rgba(245,158,11,0.12)"
                : "0 0 0 3px rgba(122,78,0,0.1)",
            },
          },
          "& .MuiInputLabel-root":           { color: dk ? "#7A6B5A" : "#9A7E58" },
          "& .MuiInputLabel-root.Mui-focused": { color: dk ? "#F59E0B" : "#7A4E00" },
          "& .MuiInputBase-input":           { color: dk ? "#EDE8DF" : "#1C1206" },
          "& .MuiFormHelperText-root":       { color: dk ? "#7A6B5A" : "#9A7E58" },
          "& .MuiFormHelperText-root.Mui-error": { color: dk ? "#F87171" : "#DC2626" },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: dk ? "#2E2418" : "rgba(0,0,0,0.08)" },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: dk
          ? { backgroundColor: "#251D13", border: "1px solid #3D3020", color: "#C4A882" }
          : { backgroundColor: "#EFE4D0", border: "1px solid rgba(0,0,0,0.1)", color: "#6B4F2C" },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          color: dk ? "#A8927A" : "#9A7E58",
          "&.Mui-selected": { color: dk ? "#F59E0B" : "#7A4E00" },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: dk ? "#F59E0B" : "#7A4E00" },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: dk ? "#2A2018" : "#1C1206",
          color:           dk ? "#EDE8DF" : "#FDFAF5",
          fontSize:        "0.75rem",
          borderRadius:    6,
          padding:         "5px 10px",
        },
      },
    },
  };
}
