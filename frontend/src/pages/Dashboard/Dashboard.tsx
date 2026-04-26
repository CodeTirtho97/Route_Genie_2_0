import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Skeleton, LinearProgress, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, Globe, MapPin, Calendar, CheckSquare, ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { tripService } from "../../services/trip.service";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer } from "../../theme/motion";
import type { TripListItem } from "../../types/trip.types";

// ── Helpers ────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
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

// ── Geolocation city ──────────────────────────────────────────
function useLocationCity() {
  const [city, setCity] = useState<string | null>(null);
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
            { headers: { "Accept-Language": "en" } }
          );
          const d = await r.json();
          const c =
            d.address?.city ??
            d.address?.town ??
            d.address?.village ??
            d.address?.state_district ??
            d.address?.state;
          if (c) setCity(c as string);
        } catch { /* silent */ }
      },
      () => { /* permission denied — silent */ },
      { timeout: 6000, maximumAge: 120_000 }
    );
  }, []);
  return city;
}

// ── TripCard ───────────────────────────────────────────────────
function TripCard({ trip, isDark, border, paper }: {
  trip: TripListItem; isDark: boolean; border: string; paper: string;
}) {
  const theme = useTheme();
  const typeColor   = TYPE_COLORS[trip.trip_type] ?? "#F59E0B";
  const statusColor = STATUS_COLORS[trip.status]  ?? "#94A3B8";

  return (
    <Box
      component={RouterLink}
      to={ROUTES.tripDetail(trip.id)}
      sx={{
        display: "block", textDecoration: "none",
        borderRadius: "14px", overflow: "hidden",
        border: `1px solid ${border}`, backgroundColor: paper,
        transition: "transform 0.18s, box-shadow 0.18s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: isDark ? "0 10px 36px rgba(0,0,0,0.45)" : "0 8px 28px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Cover */}
      <Box sx={{ position: "relative", height: 130, overflow: "hidden" }}>
        {trip.cover_image_url ? (
          <>
            <Box
              component="img"
              src={trip.cover_image_url}
              alt={trip.destination}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,11,8,0.65) 0%, transparent 55%)" }} />
          </>
        ) : (
          <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${typeColor}22 0%, ${typeColor}44 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Globe size={28} style={{ color: typeColor, opacity: 0.4 }} />
          </Box>
        )}
        <Box sx={{ position: "absolute", top: 8, right: 8, px: 1, py: 0.3, borderRadius: "6px", backgroundColor: "rgba(0,0,0,0.58)", backdropFilter: "blur(8px)" }}>
          <Typography sx={{ fontSize: "0.62rem", color: statusColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, textTransform: "capitalize" }}>
            {trip.status}
          </Typography>
        </Box>
        {trip.ai_generated && (
          <Box sx={{ position: "absolute", top: 8, left: 8, px: 0.9, py: 0.2, borderRadius: "5px", backgroundColor: "rgba(245,158,11,0.85)" }}>
            <Typography sx={{ fontSize: "0.58rem", color: "#12100A", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>✦ AI</Typography>
          </Box>
        )}
        {trip.cover_image_url && (
          <Box sx={{ position: "absolute", bottom: 10, left: 14, right: 14 }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#FDFAF5", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {trip.title}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Body */}
      <Box sx={{ p: 1.75 }}>
        {!trip.cover_image_url && (
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {trip.title}
          </Typography>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
          <MapPin size={12} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {trip.destination}, {trip.country}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: "0.7rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {formatDateRange(trip.start_date, trip.end_date)}
          </Typography>
          <Box sx={{ px: 0.75, py: 0.2, borderRadius: "5px", backgroundColor: `${typeColor}18`, border: `1px solid ${typeColor}30` }}>
            <Typography sx={{ fontSize: "0.62rem", color: typeColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>
              {trip.trip_type}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── StatCard ───────────────────────────────────────────────────
function StatCard({ label, value, Icon, color, border, paper, isDark }: {
  label: string; value: string | number;
  Icon: React.FC<{ size?: number }>; color: string;
  border: string; paper: string; isDark: boolean;
}) {
  return (
    <Box sx={{
      p: 2, borderRadius: "12px", backgroundColor: paper,
      border: `1px solid ${border}`,
      display: "flex", alignItems: "center", gap: 1.5,
      position: "relative", overflow: "hidden",
    }}>
      <Box sx={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2.5px",
        backgroundColor: color, opacity: 0.75,
      }} />
      <Box sx={{
        width: 36, height: 36, borderRadius: "9px",
        backgroundColor: `${color}1A`, border: `1px solid ${color}28`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0,
      }}>
        <Icon size={16} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, color: isDark ? "#E8D5B4" : "#1C1206", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: "0.68rem", color: isDark ? "#7A6B5A" : "#8B6B40", fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.3 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Dashboard() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user } = useAuthStore();
  const locationCity = useLocationCity();

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const firstName = user?.name?.split(" ")[0] ?? "Traveller";
  const now   = new Date();
  const hour  = now.getHours();
  const greeting =
    hour < 5  ? "Good night"
    : hour < 12 ? "Good morning"
    : hour < 18 ? "Good afternoon"
    :             "Good evening";

  const { data: tripsData, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripService.list({ limit: 6 }),
  });

  const { data: allTripsData, isLoading: statsLoading } = useQuery({
    queryKey: ["trips", "all"],
    queryFn: () => tripService.list({ limit: 200 }),
  });

  const trips           = tripsData?.data   ?? [];
  const totalTrips      = tripsData?.total  ?? 0;
  const upcomingTrips   = trips.filter((t) => t.status === "planned").length;
  const completedTrips  = trips.filter((t) => t.status === "completed").length;
  const uniqueCountries = new Set(trips.map((t) => t.country)).size;

  // Travel profile stats — computed from ALL trips
  const allTrips        = allTripsData?.data ?? [];
  const totalDays       = allTrips.reduce((s, t) => s + (t.duration_days || 0), 0);
  const avgDuration     = allTrips.length > 0 ? Math.round(totalDays / allTrips.length) : 0;
  const uniqueDests     = new Set(allTrips.map((t) => t.destination)).size;
  const typeCount       = allTrips.reduce<Record<string, number>>((acc, t) => {
    acc[t.trip_type] = (acc[t.trip_type] ?? 0) + 1;
    return acc;
  }, {});
  const typeEntries     = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
  const topType         = typeEntries[0]?.[0] ?? null;
  const topTypeColor    = topType ? (TYPE_COLORS[topType] ?? "#F59E0B") : "#F59E0B";

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1400 }}>

        {/* ── Two-column layout ───────────────────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "380px 1fr" }, gap: 4, alignItems: "start" }}>

          {/* ── LEFT column ─────────────────────────────────── */}
          <Box>

            {/* Greeting */}
            <motion.div variants={fadeUp}>
              <Box sx={{ mb: 3.5 }}>
                <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.9rem", md: "2.3rem" }, letterSpacing: "-0.02em", lineHeight: 1.15, mb: 0.6 }}>
                  {greeting},<br />{firstName} ✦
                </Typography>
                <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  {locationCity ? ` · ${locationCity}` : ""}
                </Typography>
              </Box>
            </motion.div>

            {/* Quick Overview — stats */}
            <motion.div variants={fadeUp}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
                Quick Overview
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3.5 }}>
                <StatCard label="Total trips"  value={isLoading ? "—" : totalTrips}      Icon={Globe}       color="#F59E0B" isDark={isDark} border={border} paper={paper} />
                <StatCard label="Upcoming"     value={isLoading ? "—" : upcomingTrips}   Icon={Calendar}    color="#4ADE80" isDark={isDark} border={border} paper={paper} />
                <StatCard label="Countries"    value={isLoading ? "—" : uniqueCountries} Icon={MapPin}      color="#60A5FA" isDark={isDark} border={border} paper={paper} />
                <StatCard label="Completed"    value={isLoading ? "—" : completedTrips}  Icon={CheckSquare} color="#C084FC" isDark={isDark} border={border} paper={paper} />
              </Box>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeUp}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>

                {/* PRIMARY action — highlighted */}
                <Box
                  component={RouterLink}
                  to={ROUTES.tripCreate}
                  sx={{
                    p: 2.25, borderRadius: "14px", textDecoration: "none",
                    border: `1.5px solid ${pri}50`,
                    background: isDark
                      ? `linear-gradient(135deg, rgba(245,158,11,0.11) 0%, rgba(245,158,11,0.04) 100%)`
                      : `linear-gradient(135deg, rgba(245,158,11,0.09) 0%, rgba(245,158,11,0.02) 100%)`,
                    display: "flex", alignItems: "center", gap: 1.75,
                    boxShadow: isDark
                      ? `0 0 0 1px ${pri}1A, 0 4px 22px ${pri}16`
                      : `0 0 0 1px ${pri}12, 0 4px 16px ${pri}0E`,
                    transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isDark
                        ? `0 0 0 1px ${pri}35, 0 8px 30px ${pri}24`
                        : `0 0 0 1px ${pri}25, 0 8px 22px ${pri}1A`,
                      borderColor: `${pri}80`,
                    },
                  }}
                >
                  <Box sx={{ width: 42, height: 42, borderRadius: "11px", backgroundColor: `${pri}22`, border: `1.5px solid ${pri}38`, display: "flex", alignItems: "center", justifyContent: "center", color: pri, flexShrink: 0 }}>
                    <Plus size={19} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Plan a new trip
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Set destination, dates & budget
                    </Typography>
                  </Box>
                  <Box sx={{ color: pri }}><ArrowRight size={16} /></Box>
                </Box>

              </Box>
            </motion.div>

            {/* Travel Profile */}
            <motion.div variants={fadeUp}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.5, mt: 3.5 }}>
                Travel Profile
              </Typography>
              <Box sx={{ p: 2.5, borderRadius: "14px", backgroundColor: paper, border: `1px solid ${border}` }}>
                {statsLoading ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.75 }}>
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="text" height={44} sx={{ borderRadius: "8px" }} />)}
                  </Box>
                ) : allTrips.length === 0 ? (
                  <Typography sx={{ fontSize: "0.8rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", textAlign: "center", py: 1 }}>
                    Stats will appear once you've added trips.
                  </Typography>
                ) : (
                  <>
                    {/* 2×2 stat tiles */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, mb: 2.25 }}>
                      {[
                        { label: "Days travelled",  value: totalDays,   color: "#F59E0B" },
                        { label: "Avg trip length",  value: avgDuration > 0 ? `${avgDuration}d` : "—", color: "#60A5FA" },
                        { label: "Destinations",    value: uniqueDests, color: "#4ADE80" },
                        { label: "Countries",       value: new Set(allTrips.map(t => t.country)).size, color: "#C084FC" },
                      ].map(({ label, value, color }) => (
                        <Box key={label} sx={{ p: 1.25, borderRadius: "10px", backgroundColor: `${color}0E`, border: `1px solid ${color}20` }}>
                          <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, color: isDark ? "#E8D5B4" : "#1C1206", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.1, mb: 0.3 }}>
                            {value}
                          </Typography>
                          <Typography sx={{ fontSize: "0.62rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                            {label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Trip type breakdown */}
                    {typeEntries.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: "0.6rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
                          Trip type breakdown
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                          {typeEntries.slice(0, 4).map(([type, count]) => {
                            const color = TYPE_COLORS[type] ?? "#94A3B8";
                            const pct   = Math.round((count / allTrips.length) * 100);
                            return (
                              <Box key={type}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.35 }}>
                                  <Typography sx={{ fontSize: "0.72rem", color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{type}</Typography>
                                  <Typography sx={{ fontSize: "0.68rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{count} ({pct}%)</Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={pct}
                                  sx={{
                                    height: 4, borderRadius: "2px",
                                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                                    "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: "2px" },
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                        {topType && (
                          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: topTypeColor, flexShrink: 0 }} />
                            <Typography sx={{ fontSize: "0.68rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                              Favourite style: <strong style={{ color: topTypeColor }}>{topType}</strong>
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </motion.div>
          </Box>

          {/* ── RIGHT column: recent trips ───────────────── */}
          <Box>
            <motion.div variants={fadeUp}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
                <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.5rem", letterSpacing: "-0.01em" }}>
                  Recent Trips
                </Typography>
                {totalTrips > 0 && (
                  <Button
                    component={RouterLink}
                    to={ROUTES.trips}
                    endIcon={<ArrowRight size={14} />}
                    sx={{ color: sub, fontSize: "0.8rem", textTransform: "none", fontFamily: "Plus Jakarta Sans, sans-serif", "&:hover": { color: pri } }}
                  >
                    View all ({totalTrips})
                  </Button>
                )}
              </Box>
            </motion.div>

            {isLoading ? (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rounded" height={230} sx={{ borderRadius: "14px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }} />
                ))}
              </Box>
            ) : trips.length === 0 ? (
              <Box sx={{ p: 6, borderRadius: "16px", border: `1px dashed ${border}`, textAlign: "center", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                <Box sx={{ fontSize: "3rem", mb: 1.5 }}>🗺️</Box>
                <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.2rem", mb: 0.75 }}>No trips yet</Typography>
                <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3 }}>
                  Start planning your first adventure.
                </Typography>
                <Button component={RouterLink} to={ROUTES.tripCreate} variant="contained" startIcon={<Plus size={15} />}>
                  Plan a trip
                </Button>
              </Box>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  {trips.map((trip) => (
                    <motion.div key={trip.id} variants={fadeUp}>
                      <TripCard trip={trip} isDark={isDark} border={border} paper={paper} />
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
          </Box>
        </Box>

      </Box>
    </motion.div>
  );
}
