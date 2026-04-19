import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Skeleton, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { tripService } from "../../services/trip.service";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer } from "../../theme/motion";
import type { TripListItem } from "../../types/trip.types";

// ── Icons ──────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────
const TRIP_TYPE_COLORS: Record<string, string> = {
  Adventure: "#F59E0B", Cultural: "#60A5FA", Relaxation: "#4ADE80",
  Business: "#C084FC", Family: "#FB923C", Romantic: "#F472B6",
  Solo: "#34D399", Other: "#94A3B8",
};

const STATUS_COLORS: Record<string, string> = {
  planned: "#F59E0B", ongoing: "#4ADE80", completed: "#60A5FA", cancelled: "#94A3B8",
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function TripCard({ trip, isDark, border, paper }: { trip: TripListItem; isDark: boolean; border: string; paper: string }) {
  const theme = useTheme();
  const color = TRIP_TYPE_COLORS[trip.trip_type] ?? "#F59E0B";
  const statusColor = STATUS_COLORS[trip.status] ?? "#94A3B8";

  return (
    <Box
      component={RouterLink}
      to={ROUTES.tripDetail(trip.id)}
      sx={{
        display:         "block",
        textDecoration:  "none",
        borderRadius:    "14px",
        overflow:        "hidden",
        border:          `1px solid ${border}`,
        backgroundColor: paper,
        transition:      "transform 0.18s, box-shadow 0.18s",
        "&:hover": {
          transform:  "translateY(-2px)",
          boxShadow:  isDark ? `0 8px 32px rgba(0,0,0,0.4)` : `0 8px 24px rgba(0,0,0,0.1)`,
        },
      }}
    >
      {/* Cover */}
      <Box sx={{ position: "relative", height: 110, overflow: "hidden" }}>
        {trip.cover_image_url ? (
          <Box component="img" src={trip.cover_image_url} alt={trip.destination} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ color, opacity: 0.5 }}><GlobeIcon /></Box>
          </Box>
        )}
        <Box sx={{ position: "absolute", top: 8, right: 8, px: 1, py: 0.25, borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
          <Typography sx={{ fontSize: "0.65rem", color: statusColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, textTransform: "capitalize" }}>
            {trip.status}
          </Typography>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 1.75 }}>
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 0.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {trip.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
          <Box sx={{ color: theme.palette.text.secondary, display: "flex" }}><MapPinIcon /></Box>
          <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {trip.destination}, {trip.country}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "0.72rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {formatDateRange(trip.start_date, trip.end_date)}
          </Typography>
          <Box sx={{ px: 0.75, py: 0.2, borderRadius: "5px", backgroundColor: `${color}18`, border: `1px solid ${color}30` }}>
            <Typography sx={{ fontSize: "0.65rem", color, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>
              {trip.trip_type}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function StatCard({ label, value, icon: Icon, color, isDark, border, paper }: { label: string; value: string | number; icon: React.FC; color: string; isDark: boolean; border: string; paper: string }) {
  return (
    <Box sx={{
      p: 2.5, borderRadius: "14px", backgroundColor: paper, border: `1px solid ${border}`,
      display: "flex", alignItems: "center", gap: 2,
    }}>
      <Box sx={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        <Icon />
      </Box>
      <Box>
        <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: isDark ? "#E8D5B4" : "#1C1206", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: isDark ? "#7A6B5A" : "#8B6B40", fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.25 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Dashboard() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user } = useAuthStore();

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const firstName = user?.name?.split(" ")[0] ?? "Traveller";

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const { data: tripsData, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripService.list({ limit: 6 }),
  });

  const trips = tripsData?.data ?? [];
  const totalTrips = tripsData?.total ?? 0;
  const upcomingTrips = trips.filter((t) => t.status === "planned").length;
  const uniqueCountries = new Set(trips.map((t) => t.country)).size;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1200 }}>

        {/* ── Header ─────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.8rem", md: "2.2rem" }, letterSpacing: "-0.02em", lineHeight: 1.1, mb: 0.5 }}>
                {greeting}, {firstName} ✦
              </Typography>
              <Typography sx={{ color: sub, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to={ROUTES.tripCreate}
              variant="contained"
              startIcon={<PlusIcon />}
              sx={{ px: 3, py: 1.2, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem", flexShrink: 0 }}
            >
              Plan a trip
            </Button>
          </Box>
        </motion.div>

        {/* ── Stats row ──────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 4 }}>
            <StatCard label="Total trips"     value={isLoading ? "—" : totalTrips}      icon={GlobeIcon}    color="#F59E0B" isDark={isDark} border={border} paper={paper} />
            <StatCard label="Upcoming"        value={isLoading ? "—" : upcomingTrips}   icon={CalendarIcon} color="#4ADE80" isDark={isDark} border={border} paper={paper} />
            <StatCard label="Countries"       value={isLoading ? "—" : uniqueCountries} icon={MapPinIcon}   color="#60A5FA" isDark={isDark} border={border} paper={paper} />
          </Box>
        </motion.div>

        {/* ── Recent trips ───────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.3rem" }}>
              Recent trips
            </Typography>
            {totalTrips > 0 && (
              <Button
                component={RouterLink}
                to={ROUTES.trips}
                endIcon={<ArrowRightIcon />}
                sx={{ color: sub, fontSize: "0.8rem", textTransform: "none", fontFamily: "Plus Jakarta Sans, sans-serif", "&:hover": { color: pri } }}
              >
                View all
              </Button>
            )}
          </Box>

          {isLoading ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={210} sx={{ borderRadius: "14px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }} />
              ))}
            </Box>
          ) : trips.length === 0 ? (
            <Box sx={{
              p: 5, borderRadius: "16px", border: `1px dashed ${border}`,
              textAlign: "center", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            }}>
              <Box sx={{ fontSize: "2.5rem", mb: 1.5 }}>🗺️</Box>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.2rem", mb: 0.75 }}>
                No trips yet
              </Typography>
              <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3 }}>
                Start planning your first adventure.
              </Typography>
              <Button component={RouterLink} to={ROUTES.tripCreate} variant="contained" startIcon={<PlusIcon />}>
                Plan a trip
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2 }}>
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} isDark={isDark} border={border} paper={paper} />
              ))}
            </Box>
          )}
        </motion.div>

        {/* ── Quick actions ──────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>

            <Box
              component={RouterLink}
              to={ROUTES.tripCreate}
              sx={{
                p: 3, borderRadius: "16px", border: `1px solid ${border}`,
                backgroundColor: paper, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 2,
                transition: "transform 0.15s, box-shadow 0.15s",
                "&:hover": { transform: "translateY(-1px)", boxShadow: isDark ? "0 6px 24px rgba(0,0,0,0.3)" : "0 6px 16px rgba(0,0,0,0.08)" },
              }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: `${pri}18`, border: `1px solid ${pri}28`, display: "flex", alignItems: "center", justifyContent: "center", color: pri, flexShrink: 0 }}>
                <PlusIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  Plan a new trip
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  Set destination, dates & budget
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 3, borderRadius: "16px", border: `1px dashed ${border}`,
                backgroundColor: isDark ? "rgba(245,158,11,0.03)" : "rgba(122,78,0,0.02)",
                display: "flex", alignItems: "center", gap: 2, cursor: "not-allowed", opacity: 0.6,
              }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: "12px", backgroundColor: `${pri}12`, border: `1px solid ${pri}20`, display: "flex", alignItems: "center", justifyContent: "center", color: pri, flexShrink: 0 }}>
                <SparkleIcon />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                    AI Agent
                  </Typography>
                  <Box sx={{ px: 0.75, py: 0.15, borderRadius: "4px", backgroundColor: `${pri}18`, fontSize: "0.6rem", color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>
                    Coming soon
                  </Box>
                </Box>
                <Typography sx={{ fontSize: "0.78rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  Let AI plan your full itinerary
                </Typography>
              </Box>
            </Box>

          </Box>
        </motion.div>

      </Box>
    </motion.div>
  );
}
