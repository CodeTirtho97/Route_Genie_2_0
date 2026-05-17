import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ROUTES } from "../constants/routes";
import { useAuthStore } from "../store/auth.store";

export default function NotFound() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const bg      = theme.palette.background.default;
  const pri     = theme.palette.primary.main;
  const txt     = theme.palette.text.primary;
  const sub     = theme.palette.text.secondary;
  const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";

  const { user } = useAuthStore();

  return (
    <Box
      sx={{
        minHeight:      "100vh",
        backgroundColor: bg,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        textAlign:      "center",
        px:             3,
        position:       "relative",
        overflow:       "hidden",
      }}
    >
      {/* Subtle radial glow */}
      <Box sx={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 40%, ${isDark ? "rgba(245,158,11,0.07)" : "rgba(122,78,0,0.05)"} 0%, transparent 65%)`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Logo */}
        <Box component={RouterLink} to={ROUTES.home} sx={{ display: "inline-block", lineHeight: 0, mb: 3 }}>
          <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 52, width: "auto", opacity: 0.85, transition: "opacity 0.2s", "&:hover": { opacity: 1 } }} />
        </Box>

        {/* 404 number */}
        <Typography
          sx={{
            fontFamily:    "JetBrains Mono, monospace",
            fontSize:      { xs: "5rem", md: "7rem" },
            fontWeight:    700,
            color:         isDark ? "rgba(245,158,11,0.15)" : "rgba(122,78,0,0.12)",
            lineHeight:    1,
            mb:            1,
            letterSpacing: "-0.03em",
            userSelect:    "none",
          }}
        >
          404
        </Typography>

        {/* Heading */}
        <Typography
          sx={{
            fontFamily:    '"DM Serif Display", serif',
            fontSize:      { xs: "1.8rem", md: "2.4rem" },
            color:         txt,
            letterSpacing: "-0.02em",
            lineHeight:    1.2,
            mb:            1.5,
          }}
        >
          Page not found
        </Typography>

        {/* Sub */}
        <Typography
          sx={{
            color:      sub,
            fontSize:   "0.95rem",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            lineHeight: 1.7,
            maxWidth:   380,
            mb:         4,
          }}
        >
          The page you're looking for doesn't exist or may have been moved.
        </Typography>

        {/* Divider */}
        <Box sx={{ width: 40, height: "1px", background: `linear-gradient(to right, transparent, ${pri}80, transparent)`, mx: "auto", mb: 4 }} />

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            component={RouterLink}
            to={ROUTES.home}
            variant="contained"
            color="primary"
            sx={{ px: 3.5, py: 1.2, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem" }}
          >
            Go home
          </Button>
          {user && (
            <Button
              component={RouterLink}
              to={ROUTES.dashboard}
              variant="outlined"
              color="primary"
              sx={{
                px: 3.5, py: 1.2,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "0.9rem",
                borderColor: border,
                color: sub,
                "&:hover": { borderColor: pri, color: pri },
              }}
            >
              Dashboard
            </Button>
          )}
        </Box>

        {/* Subtle footer note */}
        <Typography sx={{ mt: 5, color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)", fontSize: "0.72rem", fontFamily: "JetBrains Mono, monospace" }}>
          routegenie · lost in transit
        </Typography>
      </motion.div>
    </Box>
  );
}
