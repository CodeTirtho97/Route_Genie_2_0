import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Tooltip, IconButton, Avatar, useTheme } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useUIStore } from "../../store/ui.store";
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
const AgentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const NAV = [
  { label: "Dashboard", icon: DashboardIcon, path: ROUTES.dashboard },
  { label: "Trips",     icon: TripsIcon,     path: ROUTES.trips     },
  { label: "Bookings",  icon: BookingsIcon,  path: ROUTES.bookings  },
  { label: "AI Agent",  icon: AgentIcon,     path: ROUTES.agent, badge: "Soon" },
  { label: "Profile",   icon: ProfileIcon,   path: ROUTES.profile   },
];

const SIDEBAR_W  = 232;
const SIDEBAR_IC = 68;

export default function AppLayout() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, accessToken, logout }  = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const bg      = isDark ? "#0D0B08" : "#F0E8D8";
  const sbBg    = isDark ? "#12100A" : "#EDE4D4";
  const border  = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.09)";
  const pri     = theme.palette.primary.main;
  const txt     = theme.palette.text.primary;
  const sub     = theme.palette.text.secondary;
  const width   = sidebarOpen ? SIDEBAR_W : SIDEBAR_IC;

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
          width,
          flexShrink:      0,
          position:        "fixed",
          top: 0, left: 0, bottom: 0,
          backgroundColor: sbBg,
          borderRight:     `1px solid ${border}`,
          display:         "flex",
          flexDirection:   "column",
          transition:      "width 0.22s ease",
          overflow:        "hidden",
          zIndex:          200,
        }}
      >
        {/* Logo */}
        <Box
          component={RouterLink}
          to={ROUTES.dashboard}
          sx={{
            display:         "flex",
            alignItems:      "center",
            gap:             1.25,
            px:              sidebarOpen ? 2.5 : 1.5,
            py:              2.25,
            textDecoration:  "none",
            borderBottom:    `1px solid ${border}`,
            flexShrink:      0,
            minHeight:       64,
          }}
        >
          <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 32, width: "auto", flexShrink: 0 }} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: pri, fontSize: "1.1rem", lineHeight: 1 }}>
                  RouteGenie
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Nav items */}
        <Box sx={{ flex: 1, py: 1.5, overflowY: "auto", overflowX: "hidden" }}>
          {NAV.map(({ label, icon: Icon, path, badge }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + "/");
            const item = (
              <Box
                key={label}
                component={RouterLink}
                to={path}
                sx={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            1.5,
                  px:             sidebarOpen ? 2.5 : 1.75,
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
                {/* Active indicator bar */}
                {active && (
                  <Box sx={{
                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                    width: 3, borderRadius: "0 3px 3px 0", backgroundColor: pri,
                    ml: -1,
                  }} />
                )}
                <Box sx={{ flexShrink: 0, display: "flex" }}><Icon /></Box>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      <Typography sx={{ fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: active ? 600 : 400 }}>
                        {label}
                      </Typography>
                      {badge && (
                        <Box sx={{ px: 0.75, py: 0.15, borderRadius: "4px", backgroundColor: isDark ? "rgba(245,158,11,0.15)" : "rgba(122,78,0,0.1)", fontSize: "0.6rem", color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, letterSpacing: "0.04em" }}>
                          {badge}
                        </Box>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            );

            return sidebarOpen ? item : (
              <Tooltip key={label} title={label} placement="right">
                {item}
              </Tooltip>
            );
          })}
        </Box>

        {/* Footer: theme toggle + user + logout */}
        <Box sx={{ flexShrink: 0, borderTop: `1px solid ${border}`, p: sidebarOpen ? "12px 16px" : "12px 8px" }}>
          {/* Theme toggle row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center", mb: 1.5 }}>
            {sidebarOpen && (
              <Typography sx={{ fontSize: "0.72rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Appearance
              </Typography>
            )}
            <ThemeToggle />
          </Box>

          {/* User row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", fontWeight: 700, backgroundColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(122,78,0,0.15)", color: pri, flexShrink: 0 }}>
              {initials}
            </Avatar>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: txt, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.email}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
            {sidebarOpen && (
              <Tooltip title="Log out" placement="top">
                <IconButton onClick={handleLogout} size="small" sx={{ color: sub, flexShrink: 0, "&:hover": { color: theme.palette.error.main } }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Collapsed logout */}
          {!sidebarOpen && (
            <Tooltip title="Log out" placement="right">
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <IconButton onClick={handleLogout} size="small" sx={{ color: sub, "&:hover": { color: theme.palette.error.main } }}>
                  <LogoutIcon />
                </IconButton>
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Collapse toggle button */}
        <Tooltip title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} placement="right">
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              position:        "absolute",
              top:             72,
              right:           -12,
              width:           24,
              height:          24,
              backgroundColor: sbBg,
              border:          `1px solid ${border}`,
              color:           sub,
              "&:hover":       { color: pri, backgroundColor: sbBg },
              zIndex:          10,
            }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Page content ─────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flex:       1,
          ml:         `${width}px`,
          minHeight:  "100vh",
          transition: "margin-left 0.22s ease",
          display:    "flex",
          flexDirection: "column",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
