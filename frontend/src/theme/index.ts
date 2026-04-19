import { createTheme } from "@mui/material";
import { getPalette } from "./palette";
import { typography } from "./typography";
import { shadows } from "./shadows";
import { getComponents } from "./components";

export function createAppTheme(mode: "dark" | "light") {
  return createTheme({
    palette:    getPalette(mode),
    typography,
    shadows,
    components: getComponents(mode),
    shape:      { borderRadius: 12 },
    spacing:    8,
  });
}
