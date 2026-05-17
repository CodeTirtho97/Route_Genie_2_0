import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Chip, Skeleton, TextField, InputAdornment, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { tripService } from "../../services/trip.service";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer } from "../../theme/motion";
import type { TripListItem, TripStatus } from "../../types/trip.types";

// ── Icons ──────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Adventure: "#F59E0B", Cultural: "#60A5FA", Relaxation: "#4ADE80",
  Business: "#C084FC", Family: "#FB923C", Romantic: "#F472B6",
  Solo: "#34D399", Other: "#94A3B8",
};
const STATUS_META: Record<TripStatus, { label: string; color: string }> = {
  planned:   { label: "Planned",   color: "#F59E0B" },
  ongoing:   { label: "Ongoing",   color: "#4ADE80" },
  completed: { label: "Completed", color: "#60A5FA" },
  cancelled: { label: "Cancelled", color: "#94A3B8" },
};
const FILTERS: { label: string; value: string | undefined }[] = [
  { label: "All",       value: undefined    },
  { label: "Planned",   value: "planned"    },
  { label: "Ongoing",   value: "ongoing"    },
  { label: "Completed", value: "completed"  },
  { label: "Cancelled", value: "cancelled"  },
];

function formatDateRange(start: string, end: string) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function TripCard({ trip, isDark, border, paper }: { trip: TripListItem; isDark: boolean; border: string; paper: string }) {
  const theme  = useTheme();
  const color  = TYPE_COLORS[trip.trip_type] ?? "#F59E0B";
  const status = STATUS_META[trip.status] ?? STATUS_META.planned;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div variants={fadeUp}>
      <Box
        component={RouterLink}
        to={ROUTES.tripDetail(trip.id)}
        sx={{
          display:         "block",
          textDecoration:  "none",
          borderRadius:    "16px",
          overflow:        "hidden",
          border:          `1px solid ${border}`,
          backgroundColor: paper,
          transition:      "transform 0.18s, box-shadow 0.18s",
          "&:hover":       { transform: "translateY(-3px)", boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.45)" : "0 8px 28px rgba(0,0,0,0.1)" },
        }}
      >
        {/* Cover */}
        <Box sx={{ position: "relative", height: 140, overflow: "hidden" }}>
          {trip.cover_image_url ? (
            <>
              {!imgLoaded && <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "none" }} />}
              <Box component="img" src={trip.cover_image_url} alt={trip.destination} onLoad={() => setImgLoaded(true)} sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s, opacity 0.35s", ".MuiBox-root:hover &": { transform: "scale(1.04)" }, opacity: imgLoaded ? 1 : 0 }} />
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
            </>
          ) : (
            <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${color}22 0%, ${color}55 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ color, opacity: 0.4 }}><GlobeIcon /></Box>
            </Box>
          )}

          {/* Status badge */}
          <Box sx={{ position: "absolute", top: 10, right: 10, px: 1, py: 0.3, borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: `1px solid ${status.color}30` }}>
            <Typography sx={{ fontSize: "0.65rem", color: status.color, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {status.label}
            </Typography>
          </Box>

          {/* AI badge */}
          {trip.ai_generated && (
            <Box sx={{ position: "absolute", top: 10, left: 10, px: 1, py: 0.3, borderRadius: "6px", backgroundColor: "rgba(245,158,11,0.85)", backdropFilter: "blur(8px)" }}>
              <Typography sx={{ fontSize: "0.6rem", color: "#12100A", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, letterSpacing: "0.06em" }}>
                ✦ AI
              </Typography>
            </Box>
          )}

          {/* Duration chip on cover */}
          {trip.cover_image_url && (
            <Box sx={{ position: "absolute", bottom: 10, left: 10 }}>
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                {trip.duration_days}d
              </Typography>
            </Box>
          )}
        </Box>

        {/* Body */}
        <Box sx={{ p: 2.25 }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {trip.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
            <Box sx={{ color: theme.palette.text.disabled, display: "flex" }}><MapPinIcon /></Box>
            <Typography sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {trip.destination}, {trip.country}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ color: theme.palette.text.disabled, display: "flex" }}><CalendarIcon /></Box>
              <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {formatDateRange(trip.start_date, trip.end_date)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ color: theme.palette.text.disabled, display: "flex" }}><UsersIcon /></Box>
              <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {trip.num_persons}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 1.75, pt: 1.75, borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ px: 0.9, py: 0.25, borderRadius: "6px", backgroundColor: `${color}16`, border: `1px solid ${color}28` }}>
              <Typography sx={{ fontSize: "0.68rem", color, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>
                {trip.trip_type}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {trip.currency} {trip.budget.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Trips() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery,  setSearchQuery]  = useState("");

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const { data, isLoading } = useQuery({
    queryKey: ["trips", statusFilter],
    queryFn: () => tripService.list({ status: statusFilter, limit: 50 }),
  });

  const trips = data?.data ?? [];
  const total = data?.total ?? 0;

  const q = searchQuery.trim().toLowerCase();
  const filteredTrips = q
    ? trips.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q)
      )
    : trips;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1200 }}>

        {/* Header */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3.5, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.8rem", md: "2.2rem" }, letterSpacing: "-0.02em", mb: 0.5 }}>
                My Trips
              </Typography>
              <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {isLoading ? "Loading…" : q ? `${filteredTrips.length} of ${total} trip${total !== 1 ? "s" : ""}` : `${total} trip${total !== 1 ? "s" : ""}`}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to={ROUTES.tripCreate}
              variant="contained"
              startIcon={<PlusIcon />}
              sx={{ px: 3, py: 1.2, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" }}
            >
              Plan a trip
            </Button>
          </Box>
        </motion.div>

        {/* Filter chips */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", gap: 1, mb: 3.5, flexWrap: "wrap" }}>
            {FILTERS.map((f) => {
              const active = statusFilter === f.value;
              return (
                <Chip
                  key={f.label}
                  label={f.label}
                  onClick={() => setStatusFilter(f.value)}
                  sx={{
                    fontFamily:      "Plus Jakarta Sans, sans-serif",
                    fontSize:        "0.8rem",
                    fontWeight:      active ? 600 : 400,
                    backgroundColor: active
                      ? (isDark ? "#2A1F06" : "#E8D5A0")
                      : paper,
                    color:           active ? pri : sub,
                    border:          `1px solid ${active ? pri + "50" : border}`,
                    "&:hover":       { backgroundColor: active ? undefined : (isDark ? "#1A1710" : "#EDE4D4") },
                  }}
                />
              );
            })}
          </Box>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp}>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, destination, or country…"
            size="small"
            fullWidth
            sx={{
              mb: 3.5,
              "& .MuiOutlinedInput-root": {
                fontFamily:      "Plus Jakarta Sans, sans-serif",
                fontSize:        "0.875rem",
                backgroundColor: paper,
                borderRadius:    "10px",
                "& fieldset":    { border: `1px solid ${border}` },
                "&:hover fieldset":  { borderColor: pri + "60" },
                "&.Mui-focused fieldset": { borderColor: pri },
              },
              "& input": { color: theme.palette.text.primary },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: theme.palette.text.disabled, display: "flex", mt: "1px" }}>
                      <SearchIcon />
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
          />
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2.5 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: "16px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
            ))}
          </Box>
        ) : filteredTrips.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Box sx={{ fontSize: "3rem", mb: 2 }}>{q ? "🔍" : "🗺️"}</Box>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.4rem", mb: 1 }}>
              {q ? "No matching trips" : statusFilter ? `No ${statusFilter} trips` : "No trips yet"}
            </Typography>
            <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3.5 }}>
              {q ? "Try a different search term." : statusFilter ? "Try a different filter." : "Create your first trip to get started."}
            </Typography>
            {!statusFilter && !q && (
              <Button component={RouterLink} to={ROUTES.tripCreate} variant="contained" startIcon={<PlusIcon />}>
                Plan a trip
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2.5 }}>
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} isDark={isDark} border={border} paper={paper} />
            ))}
          </Box>
        )}

        {/* View all CTA when showing dashboard-limited set */}
        {!isLoading && total > 50 && (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              endIcon={<ArrowRightIcon />}
              sx={{ color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", "&:hover": { color: pri } }}
            >
              Load more trips
            </Button>
          </Box>
        )}

      </Box>
    </motion.div>
  );
}
