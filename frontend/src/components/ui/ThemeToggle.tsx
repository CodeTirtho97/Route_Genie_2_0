import { IconButton, Tooltip, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../../store/ui.store";

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

interface ThemeToggleProps {
  sx?: object;
}

export function ThemeToggle({ sx }: ThemeToggleProps) {
  const { themeMode, toggleTheme } = useUIStore();
  const theme = useTheme();
  const isDark = themeMode === "dark";

  return (
    <Tooltip title={isDark ? "Light mode" : "Dark mode"} placement="left">
      <IconButton
        onClick={toggleTheme}
        size="small"
        aria-label="Toggle theme"
        sx={{
          width:           36,
          height:          36,
          borderRadius:    "8px",
          color:           theme.palette.text.secondary,
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          border:          `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
          transition:      "all 0.2s ease",
          "&:hover": {
            backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.08)",
            color:           theme.palette.primary.main,
            borderColor:     theme.palette.primary.main,
          },
          ...sx,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={themeMode}
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
            exit={{    opacity: 0, rotate:  30, scale: 0.7 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {/* Show what it will switch TO */}
            {isDark ? <SunIcon /> : <MoonIcon />}
          </motion.div>
        </AnimatePresence>
      </IconButton>
    </Tooltip>
  );
}
