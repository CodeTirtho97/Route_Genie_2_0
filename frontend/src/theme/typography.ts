import type { ThemeOptions } from "@mui/material/styles";
type TypographyOptions = NonNullable<ThemeOptions["typography"]>;

export const typography: TypographyOptions = {
  fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
  h1: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 700,
    fontSize: "clamp(2rem, 4vw, 3.5rem)",
  },
  h2: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: "1.875rem",
  },
  h3: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: "1.5rem",
  },
  h4: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: "1.25rem",
  },
  h5: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: "1.125rem",
  },
  h6: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: "1rem",
  },
  body1: { fontFamily: '"Inter", sans-serif', fontSize: "1rem" },
  body2: { fontFamily: '"Inter", sans-serif', fontSize: "0.875rem" },
  caption: {
    fontFamily: '"Inter", sans-serif',
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.05em",
  },
  button: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    textTransform: "none",
  },
};
