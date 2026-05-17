import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Tooltip, IconButton, Avatar, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuthStore } from "../../store/auth.store";
import { authService } from "../../services/auth.service";
import { ROUTES } from "../../constants/routes";

// ── Icons ─────────────────────────────────────────────────────
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const TripsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const BookingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const NAV = [
  { label: "Dashboard", icon: DashboardIcon, path: ROUTES.dashboard },
  { label: "Trips",     icon: TripsIcon,     path: ROUTES.trips     },
  { label: "Bookings",  icon: BookingsIcon,  path: ROUTES.bookings  },
  { label: "Profile",   icon: ProfileIcon,   path: ROUTES.profile   },
];

const SIDEBAR_W = 240;

function watermarkUrl(isDark: boolean): string {
  const sc = isDark ? "white" : "black";
  const so = isDark ? "0.07"  : "0.09";
  const fc = isDark ? "white" : "black";
  const fo = isDark ? "0.045" : "0.055";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280">` +
    `<defs><pattern id="p" width="280" height="280" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">` +
    `<line x1="-560" y1="0" x2="840" y2="0" stroke="${sc}" stroke-opacity="${so}" stroke-width="0.75"/>` +
    `<text x="140" y="50" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" letter-spacing="5" fill="${fc}" fill-opacity="${fo}">RouteGenie</text>` +
    `<line x1="-560" y1="93" x2="840" y2="93" stroke="${sc}" stroke-opacity="${so}" stroke-width="0.75"/>` +
    `<line x1="-560" y1="186" x2="840" y2="186" stroke="${sc}" stroke-opacity="${so}" stroke-width="0.75"/>` +
    `<text x="140" y="237" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" letter-spacing="5" fill="${fc}" fill-opacity="${fo}">RouteGenie</text>` +
    `</pattern></defs>` +
    `<rect width="280" height="280" fill="url(#p)"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function AppLayout() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const { user, accessToken, logout }  = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const bg      = isDark ? "#0D0B08" : "#F0E8D8";
  const sbBg    = isDark ? "#12100A" : "#EDE4D4";
  const border  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.09)";
  const pri     = theme.palette.primary.main;
  const txt     = theme.palette.text.primary;
  const sub     = theme.palette.text.secondary;
  const isDemo  = user?.email === "demo@routegenie.app";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = async () => {
    if (accessToken) await authService.logout(accessToken).catch(() => {});
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: bg }}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <Box
        component="nav"
        sx={{
          width:           SIDEBAR_W,
          flexShrink:      0,
          position:        "fixed",
          top: 0, left: 0, bottom: 0,
          backgroundColor: sbBg,
          borderRight:     `1px solid ${border}`,
          display:         "flex",
          flexDirection:   "column",
          overflow:        "hidden",
          zIndex:          200,
        }}
      >
        {/* ── User profile ────────────────────────────────── */}
        <Box
          sx={{
            display:        "flex",
            flexDirection:  "row",
            alignItems:     "center",
            gap:            1.5,
            px:             2.25,
            pt:             3,
            pb:             2,
            borderBottom:   `1px solid ${border}`,
            flexShrink:     0,
          }}
        >
          <Avatar
            src={(user as any)?.avatar_url ?? undefined}
            sx={{
              width:           40,
              height:          40,
              fontSize:        "0.85rem",
              fontWeight:      700,
              backgroundColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(122,78,0,0.15)",
              color:           pri,
              flexShrink:      0,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: txt, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name ?? "User"}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email ?? ""}
            </Typography>
          </Box>
        </Box>

        {/* ── Nav items ────────────────────────────────────── */}
        <Box sx={{ flex: 1, py: 1.5, overflowY: "auto", overflowX: "hidden" }}>
          {NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + "/");
            return (
              <Box
                key={label}
                component={RouterLink}
                to={path}
                sx={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            1.5,
                  px:             2.5,
                  py:             1.1,
                  mx:             1,
                  borderRadius:   "10px",
                  textDecoration: "none",
                  color:          active ? pri : sub,
                  backgroundColor: active
                    ? (isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.08)")
                    : "transparent",
                  transition:     "background 0.15s, color 0.15s",
                  "&:hover": {
                    backgroundColor: active
                      ? undefined
                      : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                    color: active ? pri : txt,
                  },
                  position: "relative",
                }}
              >
                {active && (
                  <Box sx={{
                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                    width: 3, borderRadius: "0 3px 3px 0", backgroundColor: pri,
                    ml: -1,
                  }} />
                )}
                <Box sx={{ flexShrink: 0, display: "flex" }}><Icon /></Box>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", overflow: "hidden", whiteSpace: "nowrap" }}
                >
                  <Typography sx={{ fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: active ? 600 : 400 }}>
                    {label}
                  </Typography>
                </motion.div>
              </Box>
            );
          })}
        </Box>

        {/* ── AI Agent (Coming Soon) ────────────────────────── */}
        <Box sx={{ px: 1, pb: 1 }}>
          <Box
            sx={{
              display:         "flex",
              alignItems:      "center",
              gap:             1.5,
              px:              2.5,
              py:              1.1,
              borderRadius:    "10px",
              color:           isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
              cursor:          "default",
              userSelect:      "none",
              border:          `1px dashed ${isDark ? "rgba(245,158,11,0.18)" : "rgba(122,78,0,0.18)"}`,
            }}
          >
            <Box sx={{ flexShrink: 0, display: "flex" }}><SparkleIcon /></Box>
            <Typography sx={{ fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", flex: 1 }}>
              AI Agent
            </Typography>
            <Box sx={{ px: 0.8, py: 0.15, borderRadius: "20px", border: "1px solid rgba(245,158,11,0.35)", backgroundColor: "rgba(245,158,11,0.07)", flexShrink: 0 }}>
              <Typography sx={{ fontSize: "0.52rem", color: "#F59E0B", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Soon
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Footer ───────────────────────────────────────── */}
        <Box sx={{ flexShrink: 0, borderTop: `1px solid ${border}`, p: "12px 14px" }}>

          {/* Demo badge */}
          {isDemo && (
            <Box sx={{
              mb: 1.5, p: "10px 12px",
              borderRadius: "10px",
              border: `1px solid ${isDark ? "rgba(245,158,11,0.22)" : "rgba(122,78,0,0.22)"}`,
              backgroundColor: isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.05)",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: pri, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Demo mode
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.7rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1, lineHeight: 1.5 }}>
                Browsing as demo. Sign up to plan your own trips.
              </Typography>
              <Button
                component={RouterLink}
                to={ROUTES.signup}
                variant="outlined"
                fullWidth
                size="small"
                sx={{
                  fontSize: "0.72rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  textTransform: "none",
                  py: 0.5,
                  borderColor: isDark ? "rgba(245,158,11,0.4)" : "rgba(122,78,0,0.4)",
                  color: pri,
                  "&:hover": {
                    borderColor: pri,
                    backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.07)",
                  },
                }}
              >
                Create free account →
              </Button>
            </Box>
          )}

          {/* Theme toggle row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography sx={{ fontSize: "0.75rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500 }}>
              {isDark ? "Switch to Light" : "Switch to Dark"}
            </Typography>
            <ThemeToggle />
          </Box>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            fullWidth
            startIcon={<LogoutIcon />}
            sx={{
              justifyContent:  "flex-start",
              fontFamily:      "Plus Jakarta Sans, sans-serif",
              fontSize:        "0.85rem",
              fontWeight:      600,
              color:           theme.palette.error.main,
              border:          `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "rgba(220,38,38,0.2)"}`,
              borderRadius:    "10px",
              py:              0.9,
              px:              1.75,
              textTransform:   "none",
              transition:      "all 0.15s",
              "&:hover": {
                backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(220,38,38,0.07)",
                borderColor:     theme.palette.error.main,
              },
            }}
          >
            Log Out
          </Button>
        </Box>
      </Box>

      {/* ── Page content ─────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flex:            1,
          ml:              `${SIDEBAR_W}px`,
          minHeight:       "100vh",
          display:         "flex",
          flexDirection:   "column",
          backgroundColor: bg,
          backgroundImage: watermarkUrl(isDark),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
