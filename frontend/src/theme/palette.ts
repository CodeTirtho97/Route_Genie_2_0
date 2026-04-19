import { PaletteOptions } from "@mui/material";

export function getPalette(mode: "dark" | "light"): PaletteOptions {
  if (mode === "light") {
    return {
      mode: "light",
      background: {
        default: "#FDFAF5",
        paper:   "#F5EFE4",
      },
      primary: {
        main:         "#7A4E00",   // darkened amber — 6.5:1 on cream
        dark:         "#5C3A00",
        light:        "#C47A00",
        contrastText: "#FDFAF5",
      },
      secondary: {
        main:         "#B84000",   // darkened terracotta
        contrastText: "#FDFAF5",
      },
      success: { main: "#16A34A" },
      warning: { main: "#D97706" },
      error:   { main: "#DC2626" },
      info:    { main: "#2563EB" },
      text: {
        primary:   "#1C1206",
        secondary: "#6B4F2C",
        disabled:  "#B09070",
      },
      divider: "rgba(0,0,0,0.1)",
    };
  }

  return {
    mode: "dark",
    background: {
      default: "#12100A",
      paper:   "#1C1710",
    },
    primary: {
      main:         "#F59E0B",
      dark:         "#D97706",
      contrastText: "#12100A",
    },
    secondary: {
      main:         "#E85D26",
      contrastText: "#12100A",
    },
    success: { main: "#4ADE80" },
    warning: { main: "#FCD34D" },
    error:   { main: "#F87171" },
    info:    { main: "#60A5FA" },
    text: {
      primary:   "#FDF6EC",
      secondary: "#C4A882",
      disabled:  "#6B5744",
    },
    divider: "#2E2418",
  };
}
