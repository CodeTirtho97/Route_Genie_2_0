import { useState, useEffect } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Skeleton, useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  ArrowLeft, Trash2, Pencil, Copy, Calendar, Users, Wallet,
  Globe, Clock, MapPin,
} from "lucide-react";
import { tripService } from "../../services/trip.service";
import { bookingService } from "../../services/booking.service";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer } from "../../theme/motion";
import type { BookingListItem, BookingCategory } from "../../types/booking.types";

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Constants ─────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Adventure: "#F59E0B", Cultural: "#60A5FA", Relaxation: "#4ADE80",
  Business: "#C084FC", Family: "#FB923C", Romantic: "#F472B6",
  Solo: "#34D399", Other: "#94A3B8",
};
const STATUS_COLORS: Record<string, string> = {
  planned: "#F59E0B", ongoing: "#4ADE80", completed: "#60A5FA", cancelled: "#94A3B8",
};
const CATEGORY_COLORS: Record<BookingCategory, string> = {
  Flight: "#60A5FA", Train: "#A78BFA", Bus: "#34D399", Hotel: "#F59E0B",
  Restaurant: "#FB923C", Activity: "#4ADE80", "Car Rental": "#F472B6", Other: "#94A3B8",
};
const BOOKING_STATUS_COLORS: Record<string, string> = {
  confirmed: "#2DD4BF", pending: "#FACC15", cancelled: "#EF4444",
};

const TABS = ["Overview", "Timeline", "Bookings", "Map"] as const;
type Tab = typeof TABS[number];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}
function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Sidebar meta row ──────────────────────────────────────────
function MetaRow({ Icon, label, value, color }: {
  Icon: React.FC<{ size?: number }>; label: string; value: string; color?: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.1, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, "&:last-child": { borderBottom: "none" } }}>
      <Box sx={{ color: color ?? (isDark ? "#7A6B5A" : "#9A7E58"), mt: "1px", flexShrink: 0 }}>
        <Icon size={14} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.65rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// ── TimelineTab ───────────────────────────────────────────────
function TimelineTab({ days, border, paper, pri, sub, isDark }: {
  days: any[]; border: string; paper: string; pri: string; sub: string; isDark: boolean;
}) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {days.map((day: any, idx: number) => (
        <Box key={day.day_number} sx={{ display: "flex", gap: 2 }}>
          {/* Day number + connector */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", backgroundColor: `${pri}18`, border: `1px solid ${pri}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: pri, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                D{day.day_number}
              </Typography>
            </Box>
            {idx < days.length - 1 && (
              <Box sx={{ width: 1, flex: 1, mt: 0.75, backgroundColor: border, minHeight: 20 }} />
            )}
          </Box>

          {/* Day content */}
          <Box sx={{ flex: 1, pb: 1 }}>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 0.25 }}>
              {day.title ?? `Day ${day.day_number}`}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mb: day.activities?.length ? 1.5 : 1 }}>
              {new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              {day.weather_summary ? ` · ${day.weather_summary}` : ""}
            </Typography>

            {day.activities?.length > 0 ? (
              day.activities.map((act: any, i: number) => (
                <Box key={i} sx={{ p: 1.5, mb: 1, borderRadius: "10px", backgroundColor: paper, border: `1px solid ${border}` }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {act.title}
                    </Typography>
                    {act.time && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                        <Clock size={12} style={{ color: sub }} />
                        <Typography sx={{ fontSize: "0.72rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{act.time}</Typography>
                      </Box>
                    )}
                  </Box>
                  {act.description && (
                    <Typography sx={{ fontSize: "0.78rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.4 }}>
                      {act.description}
                    </Typography>
                  )}
                  {act.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <MapPin size={11} style={{ color: sub }} />
                      <Typography sx={{ fontSize: "0.72rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{act.location}</Typography>
                    </Box>
                  )}
                  {act.estimated_cost > 0 && (
                    <Typography sx={{ fontSize: "0.7rem", color: isDark ? "rgba(245,158,11,0.7)" : "rgba(122,78,0,0.7)", fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.5 }}>
                      ~${act.estimated_cost}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              // Empty day placeholder
              <Box sx={{
                p: 1.5, borderRadius: "10px",
                border: `1px dashed ${border}`,
                backgroundColor: isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)",
              }}>
                <Typography sx={{ fontSize: "0.75rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", opacity: 0.55 }}>
                  No activities planned yet
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── BookingsTab ───────────────────────────────────────────────
function BookingsTab({ itineraryId, border, sub, isDark, pri }: {
  itineraryId: string; border: string; sub: string; isDark: boolean; pri: string;
}) {
  const theme = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", "trip", itineraryId],
    queryFn: () => bookingService.list({ itinerary_id: itineraryId, limit: 50 }),
  });
  const bookings = data?.data ?? [];

  if (isLoading) return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={76} sx={{ borderRadius: "12px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />)}
    </Box>
  );

  if (bookings.length === 0) return (
    <Box sx={{ py: 7, textAlign: "center" }}>
      <Box sx={{ fontSize: "2.5rem", mb: 1.5 }}>🎫</Box>
      <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.2rem", mb: 0.75 }}>No bookings for this trip</Typography>
      <Typography sx={{ color: sub, fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3 }}>
        Add flights, hotels, and activities from the Bookings page.
      </Typography>
      <Button component={RouterLink} to={ROUTES.bookings} variant="outlined" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        Go to Bookings
      </Button>
    </Box>
  );

  const totalSpend = bookings.reduce((s: number, b: BookingListItem) => s + b.price, 0);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Typography sx={{ fontSize: "0.85rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}  ·  {bookings[0]?.currency ?? "USD"} {totalSpend.toLocaleString()} total
        </Typography>
        <Button component={RouterLink} to={ROUTES.bookings} size="small" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem", color: pri, textTransform: "none" }}>
          Manage →
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {bookings.map((b: BookingListItem) => {
          const catColor = CATEGORY_COLORS[b.category] ?? "#94A3B8";
          const stColor  = BOOKING_STATUS_COLORS[b.status] ?? "#94A3B8";
          return (
            <Box key={b.id} sx={{
              p: 2, borderRadius: "12px",
              backgroundColor: isDark ? `${catColor}07` : `${catColor}06`,
              border: `1px solid ${border}`,
              borderLeft: `3px solid ${catColor}`,
              display: "flex", gap: 1.75, alignItems: "center",
            }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "9px", flexShrink: 0, backgroundColor: `${catColor}18`, border: `1px solid ${catColor}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ fontSize: "0.62rem", color: catColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, letterSpacing: "0.03em" }}>
                  {b.category.slice(0, 3).toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {b.name}
                </Typography>
                <Typography sx={{ fontSize: "0.73rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {formatShortDate(b.date)}{b.time ? ` · ${b.time}` : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.6, flexShrink: 0 }}>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {b.currency} {b.price.toLocaleString()}
                </Typography>
                <Box sx={{ px: 0.7, py: 0.15, borderRadius: "4px", backgroundColor: `${stColor}18`, border: `1px solid ${stColor}28` }}>
                  <Typography sx={{ fontSize: "0.6rem", color: stColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, textTransform: "capitalize" }}>{b.status}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// Filters only the tile pane — markers stay full-colour
function TilePaneFilter({ isDark }: { isDark: boolean }) {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane("tilePane");
    if (pane) {
      pane.style.filter = isDark
        ? "invert(1) hue-rotate(200deg) brightness(0.82) contrast(1.08) saturate(0.9)"
        : "none";
    }
  }, [map, isDark]);
  return null;
}

// ── MapTab ────────────────────────────────────────────────────
function MapTab({ destination, coordinates, border, isDark, isLoading }: {
  destination: string; coordinates: { lat: number; lng: number };
  border: string; isDark: boolean; isLoading?: boolean;
}) {
  const theme = useTheme();
  const hasCoords = coordinates.lat !== 0 || coordinates.lng !== 0;

  // Glowing pulsing beacon — amber gradient pin with animated rings + star icon
  const pinIcon = L.divIcon({
    html: `
      <style>@keyframes rg-b{0%{transform:scale(1);opacity:.75}100%{transform:scale(2.8);opacity:0}}</style>
      <div style="position:relative;width:36px;height:46px">
        <div style="position:absolute;top:0;left:2px;width:32px;height:32px;border-radius:50%;background:rgba(245,158,11,0.28);animation:rg-b 2.4s ease-out infinite;pointer-events:none"></div>
        <div style="position:absolute;top:0;left:2px;width:32px;height:32px;border-radius:50%;background:rgba(245,158,11,0.18);animation:rg-b 2.4s ease-out infinite .85s;pointer-events:none"></div>
        <div style="position:absolute;top:0;left:2px;width:32px;height:32px;background:linear-gradient(145deg,#FCD34D,#F59E0B,#B45309);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid rgba(255,255,255,0.93);box-shadow:0 0 0 3px rgba(245,158,11,0.25),0 5px 20px rgba(245,158,11,0.65),0 2px 8px rgba(0,0,0,0.5)"></div>
        <div style="position:absolute;top:9px;left:11px;width:14px;height:14px;background:rgba(255,255,255,0.97);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,0.2)">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="#B45309"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
        </div>
      </div>`,
    iconSize:    [36, 46],
    iconAnchor:  [18, 39],
    popupAnchor: [0, -44],
    className:   "",
  });

  if (isLoading) return (
    <Box sx={{ height: 480, borderRadius: "16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
      <MapPin size={16} style={{ color: theme.palette.text.secondary }} />
      <Typography sx={{ fontSize: "0.875rem", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        Locating {destination}…
      </Typography>
    </Box>
  );

  if (!hasCoords) return (
    <Box sx={{ py: 7, textAlign: "center" }}>
      <Box sx={{ fontSize: "2.5rem", mb: 1.5 }}>🗺️</Box>
      <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.2rem", mb: 0.75 }}>Map unavailable</Typography>
      <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        Could not resolve coordinates for this destination.
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ borderRadius: "16px", overflow: "hidden", border: `1px solid ${border}`, height: 480 }}>
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        <TilePaneFilter isDark={isDark} />
        <Marker position={[coordinates.lat, coordinates.lng]} icon={pinIcon}>
          <Popup>
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>
              {destination}
            </span>
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function TripDetail() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const [activeTab,  setActiveTab]  = useState<Tab>("Overview");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notes,      setNotes]      = useState("");

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => tripService.get(id!),
    enabled: !!id,
  });

  const { mutate: deleteTrip, isPending: isDeleting } = useMutation({
    mutationFn: () => tripService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate(ROUTES.trips, { replace: true });
    },
  });

  const { mutate: saveNotes, isPending: isSavingNotes } = useMutation({
    mutationFn: (text: string) => tripService.update(id!, { notes: text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", id] }),
  });

  // Sync notes state once trip loads
  useEffect(() => {
    if (trip) setNotes((trip as any).notes ?? "");
  }, [trip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bookings for budget tracker (same query key as BookingsTab — React Query deduplicates)
  const { data: bookingsData } = useQuery({
    queryKey: ["bookings", "trip", id],
    queryFn: () => bookingService.list({ itinerary_id: id!, limit: 200 }),
    enabled: !!id && !!trip,
  });
  const totalBooked = (bookingsData?.data ?? []).reduce((sum, b) => sum + b.price, 0);

  // Geocode destination when trip has no coordinates
  const rawCoordinates = (trip as any)?.coordinates ?? { lat: 0, lng: 0 };
  const needsGeocode   = !rawCoordinates.lat && !rawCoordinates.lng;

  const { data: geocodedCoords, isLoading: isGeocoding } = useQuery({
    queryKey: ["geocode", trip?.destination, trip?.country],
    queryFn: async () => {
      const q = encodeURIComponent(`${trip!.destination}, ${trip!.country}`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      return null;
    },
    enabled: !!trip && needsGeocode,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const resolvedCoords = needsGeocode
    ? (geocodedCoords ?? { lat: 0, lng: 0 })
    : rawCoordinates;

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 3, md: 4 } }}>
        <Skeleton variant="rounded" height={300} sx={{ mb: 3, borderRadius: "20px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" }, gap: 3 }}>
          <Box>
            {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={68} sx={{ mb: 1.5, borderRadius: "12px" }} />)}
          </Box>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: "14px" }} />
        </Box>
      </Box>
    );
  }

  if (error || !trip) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px", mb: 2 }}>Trip not found or you don't have access.</Alert>
        <Button component={RouterLink} to={ROUTES.trips} startIcon={<ArrowLeft size={15} />} sx={{ color: sub }}>Back to trips</Button>
      </Box>
    );
  }

  const typeColor   = TYPE_COLORS[trip.trip_type] ?? "#F59E0B";
  const statusColor = STATUS_COLORS[trip.status]  ?? "#F59E0B";

  // Build day list — use API days if available, otherwise scaffold from trip dates
  const rawDays = (trip as any).days ?? [];
  const days = rawDays.length > 0
    ? rawDays
    : Array.from({ length: Math.min(trip.duration_days || 0, 60) }, (_, i) => {
        const d = new Date(trip.start_date);
        d.setDate(d.getDate() + i);
        return { day_number: i + 1, date: d.toISOString(), title: `Day ${i + 1}`, activities: [] };
      });

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">

      {/* ── Back nav + Delete ──────────────────────────────── */}
      <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 0 }}>
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Box
              component={RouterLink}
              to={ROUTES.trips}
              sx={{
                display: "inline-flex", alignItems: "center", gap: 0.75,
                textDecoration: "none", color: sub,
                fontSize: "0.8rem", fontFamily: "Plus Jakarta Sans, sans-serif",
                transition: "color 0.15s",
                "&:hover": { color: pri },
                "@keyframes arrowNudge": {
                  "0%, 100%": { transform: "translateX(0)" },
                  "50%": { transform: "translateX(-4px)" },
                },
                "&:hover .back-arrow": { animation: "arrowNudge 0.7s ease-in-out infinite" },
              }}
            >
              <Box component="span" className="back-arrow" sx={{ display: "inline-flex", alignItems: "center" }}>
                <ArrowLeft size={14} />
              </Box>
              Back to trips
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                component={RouterLink}
                to={ROUTES.tripEdit(id!)}
                startIcon={<Pencil size={13} />}
                size="small"
                sx={{
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem",
                  color: sub, textTransform: "none",
                  border: `1px solid ${border}`,
                  borderRadius: "9px", px: 1.75, py: 0.75,
                  "&:hover": { color: pri, borderColor: `${pri}60`, backgroundColor: isDark ? "rgba(245,158,11,0.06)" : "rgba(122,78,0,0.04)" },
                }}
              >
                Edit trip
              </Button>
              <Button
                onClick={() => navigate(ROUTES.tripCreate, {
                  state: {
                    clone: {
                      title:           `Copy of ${trip.title}`,
                      destination:     trip.destination,
                      country:         trip.country,
                      start_date:      trip.start_date,
                      end_date:        trip.end_date,
                      num_persons:     trip.num_persons,
                      trip_type:       trip.trip_type,
                      budget:          trip.budget,
                      currency:        trip.currency,
                      cover_image_url: trip.cover_image_url ?? "",
                      tags:            trip.tags,
                    },
                  },
                })}
                startIcon={<Copy size={13} />}
                size="small"
                sx={{
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem",
                  color: sub, textTransform: "none",
                  border: `1px solid ${border}`,
                  borderRadius: "9px", px: 1.75, py: 0.75,
                  "&:hover": { color: pri, borderColor: `${pri}60`, backgroundColor: isDark ? "rgba(245,158,11,0.06)" : "rgba(122,78,0,0.04)" },
                }}
              >
                Clone
              </Button>
              <Button
                onClick={() => setDeleteOpen(true)}
                startIcon={<Trash2 size={13} />}
                size="small"
                sx={{
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem",
                  color: theme.palette.error.main, textTransform: "none",
                  border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "rgba(220,38,38,0.18)"}`,
                  borderRadius: "9px", px: 1.75, py: 0.75,
                  "&:hover": { backgroundColor: "rgba(239,68,68,0.06)", borderColor: theme.palette.error.main },
                }}
              >
                Delete trip
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Hero */}
      <motion.div variants={fadeUp}>
        <Box sx={{ mx: { xs: 3, md: 4 }, position: "relative", borderRadius: "20px", overflow: "hidden", mb: 0, height: { xs: 220, md: 320 } }}>
          {trip.cover_image_url ? (
            <>
              <Box component="img" src={trip.cover_image_url} alt={trip.destination} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,8,5,0.82) 0%, rgba(10,8,5,0.15) 55%, transparent 80%)" }} />
            </>
          ) : (
            <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${typeColor}22 0%, ${typeColor}55 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={48} style={{ color: typeColor, opacity: 0.25 }} />
            </Box>
          )}

          <Box sx={{ position: "absolute", bottom: 24, left: 28, right: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "#FDFAF5", fontSize: { xs: "1.75rem", md: "2.3rem" }, letterSpacing: "-0.02em", lineHeight: 1.15, textShadow: "0 2px 12px rgba(0,0,0,0.5)", mb: 0.4 }}>
                {trip.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <MapPin size={13} style={{ color: "rgba(237,232,223,0.75)" }} />
                <Typography sx={{ color: "rgba(237,232,223,0.75)", fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                  {trip.destination}, {trip.country}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75, flexShrink: 0 }}>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: `1px solid ${statusColor}35` }}>
                <Typography sx={{ fontSize: "0.72rem", color: statusColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, textTransform: "capitalize" }}>
                  {trip.status}
                </Typography>
              </Box>
              {trip.ai_generated && (
                <Box sx={{ px: 1.25, py: 0.4, borderRadius: "7px", backgroundColor: "rgba(245,158,11,0.9)" }}>
                  <Typography sx={{ fontSize: "0.63rem", color: "#12100A", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>✦ AI Generated</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* ── Two-column layout below hero ───────────────────── */}
      <Box sx={{ px: { xs: 3, md: 4 }, pt: 3, pb: 4, maxWidth: 1400 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" }, gap: 3.5, alignItems: "start" }}>

          {/* ── LEFT: tab content ───────────────────────── */}
          <motion.div variants={fadeUp}>

            {/* Tab bar */}
            <Box sx={{ display: "flex", gap: 0.5, mb: 3, borderBottom: `1px solid ${border}` }}>
              {TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <Box
                    key={tab}
                    component="button"
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      px: 2.25, py: 1.1, borderRadius: "8px 8px 0 0",
                      border: "none", background: "transparent", cursor: "pointer",
                      fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem",
                      fontWeight: active ? 700 : 400,
                      color: active ? pri : sub,
                      borderBottom: active ? `2px solid ${pri}` : "2px solid transparent",
                      mb: "-1px",
                      transition: "all 0.15s",
                      "&:hover": { color: active ? pri : theme.palette.text.primary },
                    }}
                  >
                    {tab}
                  </Box>
                );
              })}
            </Box>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {/* ── Overview ─────────────────────────── */}
                {activeTab === "Overview" && (
                  <Box>
                    {/* Tags */}
                    {trip.tags.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 3 }}>
                        {trip.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.75rem", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: sub, border: `1px solid ${border}` }} />
                        ))}
                      </Box>
                    )}

                    {/* Trip Notes */}
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          Notes
                        </Typography>
                        {isSavingNotes && (
                          <Typography sx={{ fontSize: "0.65rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", opacity: 0.6 }}>
                            Saving…
                          </Typography>
                        )}
                      </Box>
                      <Box
                        component="textarea"
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                        onBlur={() => saveNotes(notes)}
                        placeholder="Add personal notes, reminders, packing lists…"
                        rows={6}
                        sx={{
                          width: "100%", boxSizing: "border-box",
                          p: 1.75, borderRadius: "12px",
                          fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem",
                          lineHeight: 1.6, color: theme.palette.text.primary,
                          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          border: `1px solid ${border}`,
                          resize: "vertical", outline: "none",
                          transition: "border-color 0.15s",
                          "&:focus": { borderColor: pri },
                          "&::placeholder": { color: sub, opacity: 0.6 },
                        }}
                      />
                      <Typography sx={{ fontSize: "0.65rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.75, opacity: 0.55 }}>
                        Auto-saved when you click away
                      </Typography>
                    </Box>
                  </Box>
                )}

                {activeTab === "Timeline" && (
                  <TimelineTab days={days} border={border} paper={paper} pri={pri} sub={sub} isDark={isDark} />
                )}
                {activeTab === "Bookings" && (
                  <BookingsTab itineraryId={trip.id} border={border} sub={sub} isDark={isDark} pri={pri} />
                )}
                {activeTab === "Map" && (
                  <MapTab
                    destination={`${trip.destination}, ${trip.country}`}
                    coordinates={resolvedCoords}
                    border={border}
                    isDark={isDark}
                    isLoading={needsGeocode && isGeocoding}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: sticky sidebar ────────────────────── */}
          <Box sx={{ position: { lg: "sticky" }, top: 24 }}>

            {/* Trip details card */}
            <Box sx={{ p: 2.75, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2 }}>
              <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.75 }}>
                Trip Details
              </Typography>
              <MetaRow Icon={Calendar} label="Start"       value={formatDate(trip.start_date)} color={pri} />
              <MetaRow Icon={Calendar} label="End"         value={formatDate(trip.end_date)}   color={pri} />
              <MetaRow Icon={Clock}    label="Duration"    value={`${trip.duration_days} day${trip.duration_days !== 1 ? "s" : ""}`} />
              <MetaRow Icon={Users}    label="Travellers"  value={String(trip.num_persons)} />
              <MetaRow Icon={Wallet}   label="Budget"      value={`${trip.currency} ${trip.budget.toLocaleString()}`} color={typeColor} />
              <MetaRow Icon={Globe}    label="Trip Type"   value={trip.trip_type} color={typeColor} />
            </Box>

            {/* Budget tracker */}
            {trip.budget > 0 && (
              <Box sx={{ p: 2.75, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2 }}>
                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.75 }}>
                  Budget
                </Typography>
                {(() => {
                  const pct     = Math.min((totalBooked / trip.budget) * 100, 100);
                  const over    = totalBooked > trip.budget;
                  const barColor = over ? "#EF4444" : pct > 80 ? "#FACC15" : typeColor;
                  const remaining = trip.budget - totalBooked;
                  return (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                        <Typography sx={{ fontSize: "0.75rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Booked</Typography>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: over ? "#EF4444" : theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          {trip.currency} {totalBooked.toLocaleString()}
                        </Typography>
                      </Box>
                      {/* Progress bar */}
                      <Box sx={{ height: 6, borderRadius: "3px", backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden", mb: 0.75 }}>
                        <Box sx={{ height: "100%", width: `${pct}%`, borderRadius: "3px", backgroundColor: barColor, transition: "width 0.4s ease" }} />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: "0.68rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          {over ? "Over budget" : `${remaining > 0 ? trip.currency + " " + remaining.toLocaleString() + " left" : "Fully booked"}`}
                        </Typography>
                        <Typography sx={{ fontSize: "0.68rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          {trip.currency} {trip.budget.toLocaleString()} total
                        </Typography>
                      </Box>
                    </>
                  );
                })()}
              </Box>
            )}

          </Box>
        </Box>
      </Box>

      {/* Delete dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        slotProps={{ paper: { sx: { backgroundColor: isDark ? "#1A150D" : "#FDFAF5", border: `1px solid ${border}`, borderRadius: "16px", backgroundImage: "none" } } }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary }}>
          Delete this trip?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem" }}>
            <strong style={{ color: theme.palette.text.primary }}>{trip.title}</strong> and all its data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Cancel</Button>
          <Button
            onClick={() => deleteTrip()}
            disabled={isDeleting}
            variant="contained"
            sx={{ backgroundColor: theme.palette.error.main, "&:hover": { backgroundColor: theme.palette.error.dark }, fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            {isDeleting ? "Deleting…" : "Delete Trip"}
          </Button>
        </DialogActions>
      </Dialog>

    </motion.div>
  );
}
