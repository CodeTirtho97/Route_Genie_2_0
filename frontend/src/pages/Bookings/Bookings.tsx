import { useMemo, useState } from "react";
import {
  Box, Typography, Button, Skeleton, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, Select, FormControl, InputLabel,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import {
  Plus, Trash2, Pencil,
  Plane, Train, Bus, BedDouble, UtensilsCrossed, Zap, Car, Package,
  CheckCircle, Clock, XCircle, Lightbulb, MapPin, Camera,
} from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { bookingService } from "../../services/booking.service";
import { tripService } from "../../services/trip.service";
import { usePexelsPhoto } from "../../hooks/usePexelsPhoto";
import { fadeUp, staggerContainer } from "../../theme/motion";
import type { BookingCategory, BookingStatus, BookingListItem } from "../../types/booking.types";

// ── Constants ─────────────────────────────────────────────────
const CATEGORIES: BookingCategory[] = ["Flight", "Train", "Bus", "Hotel", "Restaurant", "Activity", "Car Rental", "Other"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD", "AED", "CHF"];

const CATEGORY_META: Record<BookingCategory, { Icon: React.FC<{ size?: number }>; color: string }> = {
  Flight:       { Icon: Plane,           color: "#60A5FA" },
  Train:        { Icon: Train,           color: "#A78BFA" },
  Bus:          { Icon: Bus,             color: "#34D399" },
  Hotel:        { Icon: BedDouble,       color: "#F59E0B" },
  Restaurant:   { Icon: UtensilsCrossed, color: "#FB923C" },
  Activity:     { Icon: Zap,             color: "#4ADE80" },
  "Car Rental": { Icon: Car,             color: "#F472B6" },
  Other:        { Icon: Package,         color: "#94A3B8" },
};

const STATUS_META: Record<BookingStatus, { label: string; color: string; Icon: React.FC<{ size?: number }> }> = {
  confirmed: { label: "Confirmed", color: "#2DD4BF", Icon: CheckCircle },
  pending:   { label: "Pending",   color: "#FACC15", Icon: Clock       },
  cancelled: { label: "Cancelled", color: "#EF4444", Icon: XCircle     },
};

// Pexels search queries per category
const CATEGORY_SEARCH: Record<BookingCategory, string> = {
  Flight:       "airplane wing aerial flight sky",
  Train:        "train railway journey travel",
  Bus:          "bus travel road journey",
  Hotel:        "luxury hotel room interior",
  Restaurant:   "restaurant food fine dining",
  Activity:     "adventure outdoor activity travel",
  "Car Rental": "car driving road trip scenic",
  Other:        "travel adventure journey wanderlust",
};

// Tips per category
const CATEGORY_TIPS: Record<BookingCategory, { emoji: string; color: string; overlay: string; tips: string[] }> = {
  Flight: {
    emoji: "✈️", color: "#60A5FA",
    overlay: "linear-gradient(to top, rgba(10,15,40,0.97) 30%, rgba(10,15,40,0.55) 65%, rgba(10,15,40,0.05) 100%)",
    tips: ["Book 6–8 weeks ahead for domestic, 3–6 months international.", "Tue/Wed departures are typically 10–20% cheaper.", "Compare total cost — baggage fees can double the fare."],
  },
  Train: {
    emoji: "🚂", color: "#A78BFA",
    overlay: "linear-gradient(to top, rgba(15,10,40,0.97) 30%, rgba(15,10,40,0.55) 65%, rgba(15,10,40,0.05) 100%)",
    tips: ["Advance tickets are often 50–70% off walk-up fares.", "First class on some routes is only 20% more.", "A rail pass can be economical for multi-leg trips."],
  },
  Bus: {
    emoji: "🚌", color: "#34D399",
    overlay: "linear-gradient(to top, rgba(5,25,15,0.97) 30%, rgba(5,25,15,0.55) 65%, rgba(5,25,15,0.05) 100%)",
    tips: ["Online booking saves 20–30% vs. buying on the bus.", "Night buses save both travel and accommodation costs.", "Check luggage allowance, especially on international routes."],
  },
  Hotel: {
    emoji: "🏨", color: "#F59E0B",
    overlay: "linear-gradient(to top, rgba(25,12,5,0.97) 30%, rgba(25,12,5,0.55) 65%, rgba(25,12,5,0.05) 100%)",
    tips: ["Free cancellation rooms protect against itinerary changes.", "Booking direct with the hotel often unlocks member rates.", "Off-season luxury stays can cost 40–60% less."],
  },
  Restaurant: {
    emoji: "🍽️", color: "#FB923C",
    overlay: "linear-gradient(to top, rgba(28,10,0,0.97) 30%, rgba(28,10,0,0.55) 65%, rgba(28,10,0,0.05) 100%)",
    tips: ["Book a week+ ahead at popular spots in peak season.", "Lunch menus are typically 30–40% cheaper than dinner.", "Mention special occasions for a better experience."],
  },
  Activity: {
    emoji: "⚡", color: "#4ADE80",
    overlay: "linear-gradient(to top, rgba(5,20,10,0.97) 30%, rgba(5,20,10,0.55) 65%, rgba(5,20,10,0.05) 100%)",
    tips: ["Popular experiences sell out — book weeks ahead in high season.", "Groups of 4+ often get a 10–15% discount.", "Check weather/fitness requirements for outdoor activities."],
  },
  "Car Rental": {
    emoji: "🚗", color: "#F472B6",
    overlay: "linear-gradient(to top, rgba(25,5,15,0.97) 30%, rgba(25,5,15,0.55) 65%, rgba(25,5,15,0.05) 100%)",
    tips: ["Prices rise sharply close to pickup date — book early.", "Your credit card may already provide collision damage waiver.", "Full-to-full fuel policy avoids overpriced refuelling charges."],
  },
  Other: {
    emoji: "📦", color: "#94A3B8",
    overlay: "linear-gradient(to top, rgba(10,10,20,0.97) 30%, rgba(10,10,20,0.55) 65%, rgba(10,10,20,0.05) 100%)",
    tips: ["Save all confirmation emails and QR codes in one folder.", "Screenshot tickets for offline access without roaming data.", "Note cancellation policies and modification deadlines."],
  },
};

// ── Schema ────────────────────────────────────────────────────
const schema = z.object({
  itinerary_id:        z.string().min(1, "Select a trip"),
  category:            z.string().min(1),
  name:                z.string().min(1, "Name is required"),
  origin:              z.string().optional(),
  destination_name:    z.string().optional(),
  date:                z.string().min(1, "Date is required"),
  time:                z.string().optional(),
  price:               z.number({ message: "Enter a price" }).min(0),
  currency:            z.string().min(1),
  confirmation_number: z.string().optional(),
  notes:               z.string().optional(),
  status:              z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

// ── BookingRow ────────────────────────────────────────────────
function BookingRow({ booking, border, isDark, onDelete, onEdit }: {
  booking: BookingListItem; border: string; isDark: boolean;
  onDelete: (id: string) => void; onEdit: (b: BookingListItem) => void;
}) {
  const theme = useTheme();
  const cat    = CATEGORY_META[booking.category] ?? CATEGORY_META.Other;
  const status = STATUS_META[booking.status]     ?? STATUS_META.pending;
  const { Icon: CatIcon, color: catColor }                       = cat;
  const { color: stColor, label: stLabel, Icon: StIcon }         = status;

  const dateStr = new Date(booking.date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <motion.div variants={fadeUp}>
      <Box sx={{
        display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 },
        px: { xs: 1.75, sm: 2.5 }, py: 1.5,
        borderRadius: "12px",
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${border}`,
        borderLeft: `3px solid ${catColor}`,
        transition: "background-color 0.14s, box-shadow 0.14s",
        "&:hover": {
          backgroundColor: isDark ? "#241D14" : "#EDE6D5",
          boxShadow: isDark ? "0 2px 18px rgba(0,0,0,0.22)" : "0 2px 12px rgba(0,0,0,0.07)",
        },
        "&:hover .row-actions button": { opacity: 1 },
      }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
          backgroundColor: `${catColor}16`, border: `1px solid ${catColor}24`,
          display: "flex", alignItems: "center", justifyContent: "center", color: catColor,
        }}>
          <CatIcon size={15} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {booking.name}
          </Typography>
          {(booking.origin || booking.destination_name) && (
            <Typography sx={{ fontSize: "0.72rem", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {booking.origin && booking.destination_name
                ? `${booking.origin}  →  ${booking.destination_name}`
                : booking.origin ?? booking.destination_name}
            </Typography>
          )}
        </Box>

        <Box sx={{ flexShrink: 0, display: { xs: "none", md: "block" }, minWidth: 100, textAlign: "right" }}>
          <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {dateStr}
          </Typography>
          {booking.time && (
            <Typography sx={{ fontSize: "0.7rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {booking.time}
            </Typography>
          )}
        </Box>

        <Box sx={{ flexShrink: 0, textAlign: "right", minWidth: 80 }}>
          <Typography sx={{ fontSize: "0.62rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1 }}>
            {booking.currency}
          </Typography>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2 }}>
            {booking.price.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{
          flexShrink: 0, display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.5,
          px: 1.1, py: 0.4, borderRadius: "20px",
          backgroundColor: `${stColor}12`, border: `1px solid ${stColor}28`,
        }}>
          <Box sx={{ color: stColor, display: "flex" }}><StIcon size={11} /></Box>
          <Typography sx={{ fontSize: "0.65rem", color: stColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>
            {stLabel}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }} className="row-actions">
          <Box
            component="button"
            onClick={() => onEdit(booking)}
            sx={{
              opacity: { xs: 1, sm: 0 },
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: "7px",
              border: "none", backgroundColor: "transparent", cursor: "pointer",
              color: theme.palette.text.disabled,
              transition: "opacity 0.15s, color 0.15s, background-color 0.15s",
              "&:hover": { color: theme.palette.primary.main, backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.07)" },
            }}
          >
            <Pencil size={12} />
          </Box>
          <Box
            component="button"
            onClick={() => onDelete(booking.id)}
            sx={{
              opacity: { xs: 1, sm: 0 },
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: "7px",
              border: "none", backgroundColor: "transparent", cursor: "pointer",
              color: theme.palette.text.disabled,
              transition: "opacity 0.15s, color 0.15s, background-color 0.15s",
              "&:hover": { color: theme.palette.error.main, backgroundColor: "rgba(239,68,68,0.08)" },
            }}
          >
            <Trash2 size={13} />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// ── CategoryPanel (dialog right column) ──────────────────────
function CategoryPanel({
  category, selectedTrip, isDark,
}: {
  category: BookingCategory;
  selectedTrip: { title: string; destination: string; country: string } | undefined;
  isDark: boolean;
}) {
  const meta = CATEGORY_TIPS[category] ?? CATEGORY_TIPS.Other;
  const searchQuery = CATEGORY_SEARCH[category] ?? "travel";
  const { data: photo, isLoading } = usePexelsPhoto(searchQuery);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.28 }}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Dark fallback behind image */}
        <Box sx={{ position: "absolute", inset: 0, backgroundColor: isDark ? "#111827" : "#1C1206", zIndex: 0 }} />

        {/* Pexels photo */}
        {isLoading && (
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
            <CircularProgress size={22} sx={{ color: "rgba(255,255,255,0.2)" }} />
          </Box>
        )}
        {photo && (
          <Box
            component="img"
            src={photo.url_medium}
            alt={photo.alt || category}
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
          />
        )}

        {/* Gradient overlay */}
        <Box sx={{ position: "absolute", inset: 0, background: meta.overlay, zIndex: 2 }} />

        {/* Content */}
        <Box sx={{ position: "absolute", inset: 0, p: 3, display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 3, overflowY: "auto" }}>
          {/* Category badge */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: "1.6rem", mb: 0.4 }}>{meta.emoji}</Typography>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', fontSize: "1.3rem", color: "#FDFAF5", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {category} Booking
            </Typography>
          </Box>

          {/* Tips */}
          <Box sx={{ mb: selectedTrip ? 2 : 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
              <Lightbulb size={11} style={{ color: meta.color }} />
              <Typography sx={{ fontSize: "0.6rem", color: meta.color, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Booking Tips
              </Typography>
            </Box>
            {meta.tips.map((tip, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 0.875, mb: 0.8 }}>
                <Box sx={{ width: 3.5, height: 3.5, borderRadius: "50%", backgroundColor: `${meta.color}80`, mt: "6px", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.75rem", color: "rgba(237,232,223,0.75)", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.55 }}>
                  {tip}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Selected trip context */}
          {selectedTrip && (
            <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Typography sx={{ fontSize: "0.58rem", color: "rgba(237,232,223,0.5)", fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.3 }}>
                Booking for
              </Typography>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#FDFAF5", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2 }}>
                {selectedTrip.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.35 }}>
                <MapPin size={10} style={{ color: "rgba(237,232,223,0.55)" }} />
                <Typography sx={{ fontSize: "0.7rem", color: "rgba(237,232,223,0.6)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {selectedTrip.destination}, {selectedTrip.country}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Photo credit */}
          {photo && (
            <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 0.5 }}>
              <Camera size={9} style={{ color: "rgba(255,255,255,0.2)" }} />
              <Typography sx={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Photo by {photo.photographer} · Pexels
              </Typography>
            </Box>
          )}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Bookings() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const qc     = useQueryClient();

  const border   = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri      = theme.palette.primary.main;
  const sub      = theme.palette.text.secondary;
  const paper    = theme.palette.background.paper;
  const labelSx  = { fontSize: "0.63rem", fontWeight: 700, color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.09em", mb: 1 };

  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter,   setStatusFilter]   = useState<string>("");
  const [dialogOpen,     setDialogOpen]     = useState(false);
  const [dialogMode,     setDialogMode]     = useState<"create" | "edit">("create");
  const [editingBooking, setEditingBooking] = useState<BookingListItem | null>(null);
  const [formError,      setFormError]      = useState<string | null>(null);

  // ── Single query — stats + list both derived from one source ──
  const { data: allData, isLoading } = useQuery({
    queryKey: ["bookings", "all"],
    queryFn:  () => bookingService.list({ limit: 500 }),
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: tripsData } = useQuery({
    queryKey: ["trips"],
    queryFn:  () => tripService.list({ limit: 100 }),
  });

  const allBookings = allData?.data ?? [];
  const trips       = tripsData?.data ?? [];

  // Client-side filtered list
  const bookings = useMemo(() =>
    allBookings
      .filter((b) => !categoryFilter || b.category === categoryFilter)
      .filter((b) => !statusFilter   || b.status   === statusFilter),
    [allBookings, categoryFilter, statusFilter],
  );

  // ── Stats ─────────────────────────────────────────────────────
  const totalBookings = allData?.total ?? allBookings.length;
  const totalSpend    = allBookings.reduce((s, b) => s + (b.price ?? 0), 0);
  const confirmedN    = allBookings.filter((b) => b.status === "confirmed").length;
  const today         = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingN     = allBookings.filter((b) => { const d = new Date(b.date); d.setHours(0,0,0,0); return d >= today; }).length;
  const pastN         = allBookings.filter((b) => { const d = new Date(b.date); d.setHours(0,0,0,0); return d < today; }).length;

  // ── Mutations ─────────────────────────────────────────────────
  const invalidateAll = () => qc.invalidateQueries({ queryKey: ["bookings"] });

  const createMutation = useMutation({
    mutationFn: bookingService.create,
    onSuccess:  () => { invalidateAll(); setDialogOpen(false); reset(); setFormError(null); },
    onError:    (e: any) => setFormError(e?.response?.data?.detail ?? "Failed to create booking"),
  });
  const deleteMutation = useMutation({
    mutationFn: bookingService.delete,
    onSuccess:  () => invalidateAll(),
  });
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bookingService.update(id, data),
    onSuccess:  () => { invalidateAll(); setDialogOpen(false); setEditingBooking(null); setFormError(null); },
    onError:    (e: any) => setFormError(e?.response?.data?.detail ?? "Failed to update booking"),
  });

  // ── Form ──────────────────────────────────────────────────────
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "Flight", currency: "USD", price: 0, status: "pending" },
  });

  const watchedCategory  = (watch("category") || "Flight") as BookingCategory;
  const watchedTripId    = watch("itinerary_id");
  const selectedTrip     = trips.find((t) => t.id === watchedTripId);

  const openCreate = () => {
    setDialogMode("create");
    setEditingBooking(null);
    reset({ category: "Flight", currency: "USD", price: 0, status: "pending" });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (b: BookingListItem) => {
    setDialogMode("edit");
    setEditingBooking(b);
    reset({
      itinerary_id:        b.itinerary_id,
      category:            b.category,
      name:                b.name,
      origin:              b.origin ?? "",
      destination_name:    b.destination_name ?? "",
      date:                b.date.slice(0, 10),
      time:                b.time ?? "",
      price:               b.price,
      currency:            b.currency,
      confirmation_number: b.confirmation_number ?? "",
      notes:               b.notes ?? "",
      status:              b.status,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    setFormError(null);
    const payload = {
      itinerary_id:        values.itinerary_id,
      category:            values.category as BookingCategory,
      name:                values.name,
      origin:              values.origin            || undefined,
      destination_name:    values.destination_name  || undefined,
      date:                new Date(values.date).toISOString(),
      time:                values.time              || undefined,
      price:               values.price,
      currency:            values.currency,
      confirmation_number: values.confirmation_number || undefined,
      notes:               values.notes             || undefined,
      status:              (values.status as BookingStatus) || undefined,
    };
    if (dialogMode === "edit" && editingBooking) {
      editMutation.mutate({ id: editingBooking.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const selectSx = {
    fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem",
    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: border },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.22)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: pri },
  };
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      "& fieldset": { borderColor: border },
      "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" },
      "&.Mui-focused fieldset": { borderColor: pri },
    },
    "& .MuiInputLabel-root": { fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: pri },
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1100 }}>

        {/* ── Header ───────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3.5, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.8rem", md: "2.2rem" }, letterSpacing: "-0.02em", mb: 0.5 }}>
                Bookings
              </Typography>
              <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {isLoading ? "Loading…" : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}${categoryFilter || statusFilter ? " · filtered" : ""}`}
              </Typography>
            </Box>
            <Button
              onClick={openCreate}
              variant="contained"
              startIcon={<Plus size={16} />}
              sx={{ px: 3, py: 1.2, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" }}
            >
              Add Booking
            </Button>
          </Box>
        </motion.div>

        {/* ── Stats strip ──────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Box sx={{
            display: "flex", borderRadius: "14px",
            backgroundColor: paper, border: `1px solid ${border}`,
            mb: 3.5, overflow: "hidden",
          }}>
            {[
              { label: "total bookings", value: isLoading ? "—" : totalBookings,               accent: pri       },
              { label: "total spend",    value: isLoading ? "—" : `$${totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, accent: "#F59E0B" },
              { label: "confirmed",      value: isLoading ? "—" : confirmedN,                   accent: "#2DD4BF" },
              { label: "upcoming",       value: isLoading ? "—" : upcomingN,                    accent: "#60A5FA" },
              { label: "past",           value: isLoading ? "—" : pastN,                        accent: "#94A3B8" },
            ].map(({ label, value, accent }, i, arr) => (
              <Box
                key={label}
                sx={{
                  flex: 1, px: { xs: 1.25, sm: 2.5 }, py: 2.25,
                  borderRight: i < arr.length - 1 ? `1px solid ${border}` : "none",
                  minWidth: 0,
                }}
              >
                <Typography sx={{ fontSize: { xs: "1.15rem", sm: "1.5rem" }, fontWeight: 800, color: accent, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {value}
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>

        {/* ── Filters ──────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem", "&.Mui-focused": { color: pri } }}>
                Booking Type
              </InputLabel>
              <Select
                value={categoryFilter}
                label="Booking Type"
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={selectSx}
                MenuProps={{ slotProps: { paper: { sx: { backgroundColor: isDark ? "#1E1A13" : "#FDFAF5", backgroundImage: "none" } } } }}
              >
                <MenuItem value="" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" }}>All Types</MenuItem>
                {CATEGORIES.map((c) => {
                  const { Icon: CIcon, color: cColor } = CATEGORY_META[c];
                  return (
                    <MenuItem key={c} value={c} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box sx={{ color: cColor, display: "flex" }}><CIcon size={14} /></Box>
                        {c}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem", "&.Mui-focused": { color: pri } }}>
                Status
              </InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={selectSx}
                MenuProps={{ slotProps: { paper: { sx: { backgroundColor: isDark ? "#1E1A13" : "#FDFAF5", backgroundImage: "none" } } } }}
              >
                <MenuItem value="" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" }}>All Statuses</MenuItem>
                {(["confirmed", "pending", "cancelled"] as BookingStatus[]).map((s) => {
                  const { Icon: SIcon, color: sColor, label: sLabel } = STATUS_META[s];
                  return (
                    <MenuItem key={s} value={s} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Box sx={{ color: sColor, display: "flex" }}><SIcon size={14} /></Box>
                        {sLabel}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {(categoryFilter || statusFilter) && (
              <Button
                onClick={() => { setCategoryFilter(""); setStatusFilter(""); }}
                size="small"
                sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.8rem", color: sub, textTransform: "none" }}
              >
                Clear
              </Button>
            )}
          </Box>
        </motion.div>

        {/* ── List ─────────────────────────────────────────── */}
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" height={62} sx={{ borderRadius: "12px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
            ))}
          </Box>
        ) : bookings.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Box sx={{ fontSize: "3rem", mb: 2 }}>🎫</Box>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.4rem", mb: 1 }}>
              No bookings found
            </Typography>
            <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3.5 }}>
              {categoryFilter || statusFilter ? "Try clearing the filters." : "Add your first booking to get started."}
            </Typography>
            {!categoryFilter && !statusFilter && (
              <Button onClick={openCreate} variant="contained" startIcon={<Plus size={16} />}>
                Add Booking
              </Button>
            )}
          </Box>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {bookings.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  isDark={isDark}
                  border={border}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onEdit={openEdit}
                />
              ))}
            </Box>
          </motion.div>
        )}
      </Box>

      {/* ── Add Booking dialog — split layout ───────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: isDark ? "#1A1712" : "#FAF6EF",
              backgroundImage: "none",
              border: `1px solid ${border}`,
              borderRadius: "18px",
              overflow: "hidden",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* Two-column grid: form left, visual right */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
          flex: 1,
          overflow: "hidden",
          minHeight: 0,
        }}>

          {/* ── Form column ── */}
          <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            <DialogTitle sx={{
              fontFamily: '"DM Serif Display", serif', fontSize: "1.3rem",
              color: theme.palette.text.primary, pb: 1,
              borderBottom: `1px solid ${border}`,
              flexShrink: 0,
            }}>
              {dialogMode === "edit" ? "Edit Booking" : "Add Booking"}
            </DialogTitle>

            <DialogContent sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: "16px !important",
              pb: 1,
              // Custom scrollbar
              "&::-webkit-scrollbar": { width: 5 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)", borderRadius: 8 },
            }}>
              {formError && <Alert severity="error" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.825rem" }}>{formError}</Alert>}

              {/* Section: Trip */}
              <Box>
                <Typography sx={labelSx}>
                  Trip
                </Typography>
                <Controller name="itinerary_id" control={control} render={({ field }) => (
                  <TextField {...field} select label="Select Trip" error={!!errors.itinerary_id} helperText={errors.itinerary_id?.message} sx={fieldSx} fullWidth size="small">
                    {trips.length === 0
                      ? <MenuItem value="" disabled>No trips yet — create one first</MenuItem>
                      : trips.map((t) => <MenuItem key={t.id} value={t.id} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{t.title}</MenuItem>)
                    }
                  </TextField>
                )} />
              </Box>

              {/* Section: Type & Name */}
              <Box>
                <Typography sx={labelSx}>
                  Booking Details
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Controller name="category" control={control} render={({ field }) => (
                    <TextField {...field} select label="Type" sx={fieldSx} size="small">
                      {CATEGORIES.map((c) => {
                        const { Icon: CI, color: cc } = CATEGORY_META[c];
                        return (
                          <MenuItem key={c} value={c} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ color: cc, display: "flex" }}><CI size={14} /></Box>
                              {c}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  )} />
                  <Controller name="name" control={control} render={({ field }) => (
                    <TextField {...field} label="Name" placeholder="e.g. Air India AI 302" error={!!errors.name} helperText={errors.name?.message} sx={fieldSx} size="small" />
                  )} />
                </Box>
              </Box>

              {/* Section: Route */}
              <Box>
                <Typography sx={labelSx}>
                  Route (optional)
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Controller name="origin" control={control} render={({ field }) => (
                    <TextField {...field} label="From" placeholder="e.g. Delhi" sx={fieldSx} size="small" />
                  )} />
                  <Controller name="destination_name" control={control} render={({ field }) => (
                    <TextField {...field} label="To" placeholder="e.g. Paris" sx={fieldSx} size="small" />
                  )} />
                </Box>
              </Box>

              {/* Section: Date & Time */}
              <Box>
                <Typography sx={labelSx}>
                  Date & Time
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Controller name="date" control={control} render={({ field }) => (
                    <DatePicker
                      label="Date"
                      value={field.value ? dayjs(field.value) : null}
                      onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                      slotProps={{ textField: { error: !!errors.date, helperText: errors.date?.message, sx: fieldSx, size: "small" } }}
                    />
                  )} />
                  <Controller name="time" control={control} render={({ field }) => (
                    <TextField {...field} label="Time (optional)" placeholder="14:30" sx={fieldSx} size="small" />
                  )} />
                </Box>
              </Box>

              {/* Section: Payment */}
              <Box>
                <Typography sx={labelSx}>
                  Payment
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <Controller name="price" control={control} render={({ field }) => (
                    <TextField {...field} type="number" label="Amount" onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} error={!!errors.price} helperText={errors.price?.message} sx={fieldSx} size="small" />
                  )} />
                  <Controller name="currency" control={control} render={({ field }) => (
                    <TextField {...field} select label="Currency" sx={fieldSx} size="small">
                      {CURRENCIES.map((c) => <MenuItem key={c} value={c} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{c}</MenuItem>)}
                    </TextField>
                  )} />
                </Box>
              </Box>

              {/* Section: Reference */}
              <Box>
                <Typography sx={labelSx}>
                  Reference (optional)
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Controller name="confirmation_number" control={control} render={({ field }) => (
                    <TextField {...field} label="Confirmation #" placeholder="e.g. XYZ123" sx={fieldSx} fullWidth size="small" />
                  )} />
                  <Controller name="notes" control={control} render={({ field }) => (
                    <TextField {...field} label="Notes" multiline rows={1} sx={fieldSx} fullWidth size="small" />
                  )} />
                </Box>
              </Box>

              {/* Status — only shown when editing */}
              {dialogMode === "edit" && (
                <Box>
                  <Typography sx={labelSx}>
                    Status
                  </Typography>
                  <Controller name="status" control={control} render={({ field }) => (
                    <TextField {...field} select label="Booking Status" sx={fieldSx} fullWidth size="small">
                      {(["confirmed", "pending", "cancelled"] as BookingStatus[]).map((s) => {
                        const { color, label } = STATUS_META[s];
                        return (
                          <MenuItem key={s} value={s} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                              {label}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  )} />
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1, borderTop: `1px solid ${border}`, flexShrink: 0 }}>
              <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: sub, textTransform: "none" }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                variant="contained"
                disabled={createMutation.isPending || editMutation.isPending}
                sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", px: 3.5, textTransform: "none" }}
              >
                {(createMutation.isPending || editMutation.isPending)
                  ? "Saving…"
                  : dialogMode === "edit" ? "Save Changes" : "Add Booking"}
              </Button>
            </DialogActions>
          </Box>

          {/* ── Visual panel column (desktop only) ── */}
          <Box sx={{
            display: { xs: "none", md: "block" },
            position: "relative",
            overflow: "hidden",
            borderLeft: `1px solid ${border}`,
            borderRadius: "0 18px 18px 0",
          }}>
            <CategoryPanel
              category={watchedCategory}
              selectedTrip={selectedTrip}
              isDark={isDark}
            />
          </Box>

        </Box>
      </Dialog>
    </motion.div>
  );
}
