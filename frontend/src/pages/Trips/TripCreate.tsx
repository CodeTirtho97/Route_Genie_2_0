import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, TextField, Button, MenuItem, Chip,
  InputAdornment, Alert, Tooltip, useTheme, Autocomplete,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Camera, Compass, Users, CalendarDays, Banknote, ImageIcon, Search } from "lucide-react";
import { TravelLoader } from "../../components/ui/TravelLoader";
import { tripService } from "../../services/trip.service";
import { searchPexelsPhotos, type PexelsPhoto } from "../../services/pexels.service";
import { usePexelsPhoto } from "../../hooks/usePexelsPhoto";
import { COUNTRY_FACTS, GENERAL_FACTS } from "../../data/travelFacts";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer, buttonPress } from "../../theme/motion";
import type { TripCreate } from "../../types/trip.types";

// ── Icons ──────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Constants ──────────────────────────────────────────────────
const TRIP_TYPES = ["Adventure", "Cultural", "Relaxation", "Business", "Family", "Romantic", "Solo", "Other"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD", "AED", "CHF"];
const SUGGESTED_TAGS = ["Beach", "Mountains", "City", "History", "Food", "Hiking", "Safari", "Luxury", "Budget", "Backpacking"];

const TRIP_TYPE_META: Record<string, { emoji: string; color: string; tips: string[] }> = {
  Adventure:   { emoji: "🧗", color: "#4ADE80", tips: ["Pack light — comfort beats style outdoors.", "Research permit requirements months ahead.", "Travel insurance with emergency evacuation is essential."] },
  Cultural:    { emoji: "🏛️", color: "#A78BFA", tips: ["Book museum tickets online to skip queues.", "Local guided tours reveal stories guidebooks miss.", "Eat where locals eat — markets and side streets."] },
  Relaxation:  { emoji: "🌅", color: "#60A5FA", tips: ["Choose accommodation with fewest check-in hassles.", "Leave 30% of your itinerary unplanned.", "Slow travel — one destination, multiple days."] },
  Business:    { emoji: "💼", color: "#F59E0B", tips: ["Book aisle seats for easier laptop use.", "Keep receipts — photograph them to the cloud.", "Research tipping etiquette before client dinners."] },
  Family:      { emoji: "👨‍👩‍👧", color: "#FB923C", tips: ["Pick accommodation near activities to save transit.", "Schedule downtime — kids (and adults) need rest.", "Pack snacks — hungry travellers make poor decisions."] },
  Romantic:    { emoji: "💑", color: "#F472B6", tips: ["Reserve the special restaurants well in advance.", "Surprise your partner with one unplanned experience.", "Sunrise spots beat sunset ones for smaller crowds."] },
  Solo:        { emoji: "🧭", color: "#34D399", tips: ["Share your itinerary with someone at home.", "Hostel common rooms are the best networking venues.", "Embrace the unexpected — it's the point of solo travel."] },
  Other:       { emoji: "✈️", color: "#94A3B8", tips: ["Save all confirmations in one offline folder.", "Screenshot tickets for areas with poor signal.", "Check visa requirements 3 months ahead minimum."] },
};

// ── City autocomplete ─────────────────────────────────────────
interface CitySuggestion {
  id: string;
  label: string;
  city: string;
  country: string;
}

async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=7&addressdetails=1`,
    { headers: { "Accept-Language": "en" } },
  );
  const data: any[] = await res.json();
  const seen = new Set<string>();
  return data
    .map((item) => {
      const a = item.address ?? {};
      const city    = a.city ?? a.town ?? a.municipality ?? a.village ?? a.county ?? item.name ?? "";
      const country = a.country ?? "";
      return { id: item.place_id, label: `${city}, ${country}`, city, country };
    })
    .filter(({ city, country, label }) => {
      if (!city || !country || seen.has(label)) return false;
      seen.add(label);
      return true;
    });
}

const schema = z.object({
  title:          z.string().min(1, "Trip title is required").max(80),
  destination:    z.string().min(1, "Destination is required"),
  country:        z.string().min(1, "Country is required"),
  start_date:     z.string().min(1, "Start date is required"),
  end_date:       z.string().min(1, "End date is required"),
  num_persons:    z.number().int().min(1, "At least 1 person"),
  trip_type:      z.string().min(1),
  budget:         z.number().min(0, "Budget must be ≥ 0"),
  currency:       z.string().min(1),
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
}).refine((d) => !d.start_date || !d.end_date || d.end_date >= d.start_date, {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

type FormData = z.infer<typeof schema>;

// ── Debounce hook ─────────────────────────────────────────────
function useDebounced<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Duration helper ───────────────────────────────────────────
function durationDays(start: string, end: string) {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const d = Math.round(ms / 86400000) + 1;
  return d > 0 ? d : null;
}

// ── Destination preview panel (right column) ─────────────────
function DestinationPanel({
  destination, country, numPersons, startDate, endDate, budget, currency, tripType, isDark,
}: {
  destination: string; country: string; numPersons: number;
  startDate: string; endDate: string; budget: number; currency: string;
  tripType: string; isDark: boolean;
}) {
  const query = destination.trim().length > 1
    ? `${destination.trim()} ${country.trim()} travel landscape`
    : `${tripType} travel landscape photography`;

  const { data: photo, isLoading: photoLoading } = usePexelsPhoto(query);
  const days = durationDays(startDate, endDate);

  const dykFact = useMemo(() => {
    const norm = country.trim();
    const pool = norm && COUNTRY_FACTS[norm]?.length
      ? [...COUNTRY_FACTS[norm]]
      : [...GENERAL_FACTS];
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }, [country]); // eslint-disable-line react-hooks/exhaustive-deps

  const overlay = "linear-gradient(to top, rgba(8,8,18,0.92) 0%, rgba(8,8,18,0.5) 55%, rgba(8,8,18,0.1) 100%)";

  return (
    <Box
      sx={{
        borderRadius: "20px", overflow: "hidden",
        flex: 1,
        minHeight: 500,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
        position: "relative",
      }}
    >
      {/* Background */}
      <Box sx={{ position: "absolute", inset: 0, backgroundColor: isDark ? "#111827" : "#1a1206", zIndex: 0 }} />

      {/* Photo */}
      <AnimatePresence mode="wait">
        {photoLoading && (
          <Box key="loader" sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
            <TravelLoader />
          </Box>
        )}
        {photo && (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
          >
            <Box
              component="img"
              src={photo.url_medium}
              alt={photo.alt || destination}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        )}
        {!photo && !photoLoading && (
          <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ textAlign: "center", opacity: 0.2 }}>
              <MapPin size={40} style={{ color: "#fff" }} />
              <Typography sx={{ color: "#fff", fontSize: "0.75rem", mt: 1, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Enter a destination
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay */}
      <Box sx={{ position: "absolute", inset: 0, background: overlay, zIndex: 2 }} />

      {/* Content — pinned to bottom */}
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, p: 2.75 }}>
        {destination && (
          <motion.div
            key={destination}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.6 }}>
              <MapPin size={12} style={{ color: "rgba(253,250,245,0.55)" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(253,250,245,0.6)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {[destination, country].filter(Boolean).join(", ")}
              </Typography>
            </Box>
          </motion.div>
        )}

        {(days || numPersons > 1 || budget > 0) && (
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
            {days && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CalendarDays size={11} style={{ color: "rgba(253,250,245,0.45)" }} />
                <Typography sx={{ fontSize: "0.7rem", color: "rgba(253,250,245,0.5)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {days} day{days !== 1 ? "s" : ""}
                </Typography>
              </Box>
            )}
            {numPersons > 1 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Users size={11} style={{ color: "rgba(253,250,245,0.45)" }} />
                <Typography sx={{ fontSize: "0.7rem", color: "rgba(253,250,245,0.5)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {numPersons} travellers
                </Typography>
              </Box>
            )}
            {budget > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Banknote size={11} style={{ color: "rgba(253,250,245,0.45)" }} />
                <Typography sx={{ fontSize: "0.7rem", color: "rgba(253,250,245,0.5)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {currency} {budget.toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Did You Know — inside image */}
        {dykFact && (
          <AnimatePresence mode="wait">
            <motion.div
              key={country || "general"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ pt: 1.25, mt: 0.5, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <Typography sx={{
                  fontSize: "0.57rem", color: "rgba(245,158,11,0.85)",
                  fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.5,
                }}>
                  ✦ Did You Know?
                </Typography>
                <Typography sx={{
                  fontSize: "0.73rem", color: "rgba(253,250,245,0.62)",
                  fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.55,
                }}>
                  {dykFact}
                </Typography>
              </Box>
            </motion.div>
          </AnimatePresence>
        )}

        {photo && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <Camera size={9} style={{ color: "rgba(255,255,255,0.2)" }} />
            <Typography sx={{ fontSize: "0.57rem", color: "rgba(255,255,255,0.2)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Photo by {photo.photographer} · Pexels
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Trip tips card (below image) ──────────────────────────────
function TripTipsCard({ tripType, isDark, border, paper }: {
  tripType: string; isDark: boolean; border: string; paper: string;
}) {
  const meta = TRIP_TYPE_META[tripType];
  if (!meta) return null;
  return (
    <Box sx={{ p: 2.5, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box sx={{
          width: 28, height: 28, borderRadius: "8px",
          backgroundColor: `${meta.color}15`,
          border: `1px solid ${meta.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: "0.85rem", lineHeight: 1 }}>{meta.emoji}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: meta.color, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.1 }}>
            {tripType} Tips
          </Typography>
          <Typography sx={{ fontSize: "0.6rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2, mt: 0.1 }}>
            Curated for your trip style
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {meta.tips.map((tip, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <Box sx={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: `${meta.color}60`, mt: "7px", flexShrink: 0 }} />
            <Typography sx={{ fontSize: "0.78rem", lineHeight: 1.6, color: isDark ? "rgba(237,232,223,0.75)" : "rgba(28,18,6,0.72)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              {tip}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Pexels Cover Picker ───────────────────────────────────────
function PexelsCoverPicker({ onSelect, border, pri, isDark, autoQuery }: {
  onSelect: (url: string) => void;
  border: string; pri: string; isDark: boolean;
  autoQuery?: string;
}) {
  const [searchInput, setSearchInput] = useState(autoQuery ?? "");
  const [results,     setResults]     = useState<PexelsPhoto[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [searchLabel, setSearchLabel] = useState("");

  const runSearch = useCallback(async (q: string) => {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    const photos = await searchPexelsPhotos(query, 6);
    setSearchLabel(query);
    setResults(photos);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoQuery?.trim()) void runSearch(autoQuery);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{
      p: 2, borderRadius: "12px",
      backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
      border: `1px solid ${border}`,
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Camera size={13} style={{ color: pri }} />
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Pexels Photos
          </Typography>
        </Box>
        {autoQuery && (
          <Tooltip title="Auto-searched from your destination. Type to refine." placement="top" arrow>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 0.75, py: 0.25, borderRadius: "5px", backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", cursor: "default" }}>
              <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
              <Typography sx={{ fontSize: "0.58rem", color: "#F59E0B", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>
                Auto
              </Typography>
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Search bar */}
      <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
        <TextField
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void runSearch(searchInput); } }}
          placeholder="Refine search…"
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              fontSize: "0.8rem", fontFamily: "Plus Jakarta Sans, sans-serif",
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              "& fieldset": { borderColor: border },
              "&:hover fieldset": { borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" },
              "&.Mui-focused fieldset": { borderColor: pri },
            },
          }}
        />
        <Button
          onClick={() => void runSearch(searchInput)}
          variant="outlined"
          size="small"
          disabled={loading || !searchInput.trim()}
          sx={{
            px: 1.75, fontFamily: "Plus Jakarta Sans, sans-serif",
            borderColor: border, color: pri, flexShrink: 0, minWidth: 44,
            "@keyframes btnSpin": { from: { transform: "rotate(0)" }, to: { transform: "rotate(360deg)" } },
          }}
        >
          {loading
            ? <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid transparent", borderTopColor: pri, animation: "btnSpin 0.9s linear infinite" }} />
            : <Search size={14} />
          }
        </Button>
      </Box>

      {/* Loading shimmer */}
      {loading && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box key={i} sx={{
              aspectRatio: "16/9", borderRadius: "7px",
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              "@keyframes shimmerPulse": { "0%, 100%": { opacity: 0.4 }, "50%": { opacity: 0.9 } },
              animation: `shimmerPulse 1.4s ease-in-out ${(i - 1) * 0.1}s infinite`,
            }} />
          ))}
        </Box>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <Box>
          <Typography sx={{ fontSize: "0.6rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1 }}>
            "{searchLabel}" · {results.length} photos · click to use
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            {results.map((p) => (
              <Box
                key={p.id}
                onClick={() => onSelect(p.url)}
                sx={{
                  aspectRatio: "16/9", borderRadius: "7px", overflow: "hidden",
                  cursor: "pointer", border: "2px solid transparent",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: pri, transform: "scale(1.04)" },
                }}
              >
                <Box component="img" src={p.url_medium} alt={p.alt || "photo"} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: "0.57rem", color: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.2)", fontFamily: "Plus Jakarta Sans, sans-serif", mt: 1 }}>
            Photos provided by Pexels
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default function TripCreate() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const cloneData = (location.state as any)?.clone ?? null;

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const [tags, setTags]         = useState<string[]>(cloneData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // City autocomplete
  const [cityInput,       setCityInput]       = useState<string>(cloneData?.destination ?? "");
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [cityLoading,     setCityLoading]     = useState(false);
  const debouncedCity = useDebounced(cityInput, 380);

  useEffect(() => {
    if (debouncedCity.length < 2) { setCitySuggestions([]); return; }
    let active = true;
    setCityLoading(true);
    fetchCitySuggestions(debouncedCity).then((results) => {
      if (active) { setCitySuggestions(results); setCityLoading(false); }
    }).catch(() => { if (active) setCityLoading(false); });
    return () => { active = false; };
  }, [debouncedCity]);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: cloneData ? {
      title:           cloneData.title,
      destination:     cloneData.destination,
      country:         cloneData.country,
      start_date:      cloneData.start_date,
      end_date:        cloneData.end_date,
      num_persons:     cloneData.num_persons,
      trip_type:       cloneData.trip_type,
      budget:          cloneData.budget,
      currency:        cloneData.currency,
      cover_image_url: cloneData.cover_image_url ?? "",
    } : { trip_type: "Adventure", currency: "USD", num_persons: 1, budget: 0 },
  });

  // Watch fields for right panel
  const destination = watch("destination") ?? "";
  const country     = watch("country")     ?? "";
  const tripType    = watch("trip_type")   ?? "Adventure";
  const numPersons  = watch("num_persons") ?? 1;
  const startDate   = watch("start_date")  ?? "";
  const endDate     = watch("end_date")    ?? "";
  const budget      = watch("budget")      ?? 0;
  const currency    = watch("currency")    ?? "USD";

  const debouncedDest    = useDebounced(destination, 600);
  const debouncedCountry = useDebounced(country, 600);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TripCreate) => tripService.create(data),
    onSuccess: (trip) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate(ROUTES.tripDetail(trip.id));
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to create trip.";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t) && tags.length < 8) setTags((prev) => [...prev, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onSubmit = (data: FormData) => {
    setServerError(null);
    mutate({ ...data, trip_type: data.trip_type as TripCreate["trip_type"], cover_image_url: data.cover_image_url || undefined, tags });
  };

  const sectionTitle = (label: string) => (
    <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, mb: 2 }}>
      {label}
    </Typography>
  );

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

  const pexelsAutoQuery = debouncedDest && debouncedCountry
    ? `${debouncedDest} ${debouncedCountry} travel`
    : debouncedDest || "";

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1180 }}>

        {/* Back */}
        <motion.div variants={fadeUp}>
          <Button
            component={RouterLink}
            to={ROUTES.trips}
            startIcon={<ArrowLeftIcon />}
            sx={{
              color: sub, fontSize: "0.8rem", textTransform: "none",
              fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3, pl: 0,
              "&:hover": { color: pri },
              "@keyframes arrowBlink": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0 } },
              "&:hover .MuiButton-startIcon": { animation: "arrowBlink 0.6s step-start infinite" },
            }}
          >
            Back to trips
          </Button>
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.8rem", md: "2.2rem" }, letterSpacing: "-0.02em", mb: 0.5 }}>
            {cloneData ? "Clone trip" : "Plan a new trip"}
          </Typography>
          <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 4 }}>
            {cloneData
              ? `Cloned from "${cloneData.title.replace(/^Copy of /, "")}". Edit the details below.`
              : "Fill in the details. The right panel updates live as you type."}
          </Typography>
        </motion.div>

        {serverError && (
          <motion.div variants={fadeUp}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>{serverError}</Alert>
          </motion.div>
        )}

        {/* ── Two-column layout ── */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" },
          gap: { xs: 3, lg: 4 },
          alignItems: "stretch",
        }}>

          {/* ── LEFT: Form ── */}
          <motion.form onSubmit={handleSubmit(onSubmit)}>

            {/* ── Section: Basics ── */}
            <motion.div variants={fadeUp}>
              <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2.5 }}>
                {sectionTitle("Trip basics")}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <TextField
                    {...register("title")}
                    label="Trip title"
                    fullWidth
                    placeholder="e.g. Golden Week in Tokyo"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    {/* City autocomplete */}
                    <Controller
                      name="destination"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          freeSolo
                          options={citySuggestions}
                          getOptionLabel={(opt) => typeof opt === "string" ? opt : opt.city}
                          inputValue={cityInput}
                          filterOptions={(x) => x}
                          loading={cityLoading}
                          onInputChange={(_, value, reason) => {
                            setCityInput(value);
                            if (reason === "input" || reason === "clear") field.onChange(value);
                          }}
                          onChange={(_, value) => {
                            if (!value) return;
                            if (typeof value === "string") { field.onChange(value); return; }
                            field.onChange(value.city);
                            setCityInput(value.city);
                            setValue("country", value.country, { shouldValidate: true });
                          }}
                          slotProps={{
                            paper: { sx: { backgroundColor: isDark ? "#1E1A13" : "#FDFAF5", backgroundImage: "none", border: `1px solid ${border}`, borderRadius: "10px", mt: 0.5 } },
                          }}
                          renderOption={(props, option) => {
                            const { key, ...rest } = props as any;
                            return (
                              <Box key={key} component="li" {...rest} sx={{ px: "12px !important", py: "8px !important" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                                  <Box sx={{ color: sub, flexShrink: 0, display: "flex" }}><MapPin size={13} /></Box>
                                  <Box>
                                    <Typography sx={{ fontSize: "0.855rem", fontWeight: 600, color: "text.primary", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2 }}>
                                      {option.city}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                                      {option.country}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="City / Region"
                              placeholder="e.g. Kyoto"
                              fullWidth
                              error={!!errors.destination}
                              helperText={errors.destination?.message}
                              slotProps={{
                                ...(params.slotProps as object),
                                input: {
                                  ...(params.slotProps?.input as object),
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Box sx={{ color: sub, display: "flex" }}><MapPin size={15} /></Box>
                                    </InputAdornment>
                                  ),
                                },
                              }}
                            />
                          )}
                        />
                      )}
                    />

                    {/* Country */}
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Country"
                          fullWidth
                          placeholder="e.g. Japan"
                          error={!!errors.country}
                          helperText={errors.country?.message}
                          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><Compass size={15} /></Box></InputAdornment> } }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </motion.div>

            {/* ── Section: Dates & People ── */}
            <motion.div variants={fadeUp}>
              <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2.5 }}>
                {sectionTitle("Dates & people")}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                  <TextField
                    {...register("start_date")}
                    label="Start date"
                    type="date"
                    fullWidth
                    error={!!errors.start_date}
                    helperText={errors.start_date?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    {...register("end_date")}
                    label="End date"
                    type="date"
                    fullWidth
                    error={!!errors.end_date}
                    helperText={errors.end_date?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    {...register("num_persons", { valueAsNumber: true })}
                    label="Travellers"
                    type="number"
                    fullWidth
                    error={!!errors.num_persons}
                    helperText={errors.num_persons?.message}
                    slotProps={{ htmlInput: { min: 1, max: 50 } }}
                  />
                </Box>
              </Box>
            </motion.div>

            {/* ── Section: Budget & Type ── */}
            <motion.div variants={fadeUp}>
              <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2.5 }}>
                {sectionTitle("Budget & style")}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 2fr" }, gap: 2 }}>
                  <TextField
                    {...register("budget", { valueAsNumber: true })}
                    label="Total budget"
                    type="number"
                    fullWidth
                    error={!!errors.budget}
                    helperText={errors.budget?.message}
                    slotProps={{ htmlInput: { min: 0, step: 100 }, input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><Banknote size={15} /></Box></InputAdornment> } }}
                  />
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Currency" select fullWidth>
                        {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="trip_type"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Trip type" select fullWidth>
                        {TRIP_TYPES.map((t) => {
                          const meta = TRIP_TYPE_META[t];
                          return (
                            <MenuItem key={t} value={t}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontSize: "0.9rem" }}>{meta?.emoji ?? "✈️"}</Typography>
                                {t}
                              </Box>
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    )}
                  />
                </Box>
              </Box>
            </motion.div>

            {/* ── Section: Tags ── */}
            <motion.div variants={fadeUp}>
              <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2.5 }}>
                {sectionTitle("Tags (optional)")}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {SUGGESTED_TAGS.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => addTag(tag)}
                      disabled={tags.includes(tag)}
                      sx={{
                        fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.75rem",
                        backgroundColor: tags.includes(tag) ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(122,78,0,0.1)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
                        color: tags.includes(tag) ? pri : sub,
                        border: `1px solid ${tags.includes(tag) ? pri + "40" : border}`,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Box>
                {tags.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onDelete={() => removeTag(tag)}
                        deleteIcon={<Box sx={{ display: "flex", color: "inherit" }}><XIcon /></Box>}
                        sx={{
                          fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.75rem",
                          backgroundColor: isDark ? "rgba(245,158,11,0.12)" : "rgba(122,78,0,0.08)",
                          color: pri, border: `1px solid ${pri}30`,
                        }}
                      />
                    ))}
                  </Box>
                )}
                <TextField
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                  label="Custom tag"
                  fullWidth
                  placeholder="Type and press Enter"
                  size="small"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button size="small" onClick={() => addTag(tagInput)} sx={{ minWidth: 0, p: 0.5, color: pri }}><PlusIcon /></Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </motion.div>

            {/* ── Section: Cover image ── */}
            <motion.div variants={fadeUp}>
              <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 3.5 }}>
                {sectionTitle("Cover image (optional)")}

                <Controller
                  name="cover_image_url"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Image URL"
                      fullWidth
                      placeholder="https://images.pexels.com/..."
                      error={!!errors.cover_image_url}
                      helperText={errors.cover_image_url?.message ?? "Paste a direct image URL, or search Pexels below"}
                      sx={{ mb: 2 }}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><ImageIcon size={15} /></Box></InputAdornment> } }}
                    />
                  )}
                />

                <Button
                  size="small"
                  onClick={() => setShowCoverPicker((v) => !v)}
                  startIcon={<Camera size={13} />}
                  sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem", color: pri, textTransform: "none", pl: 0 }}
                >
                  {showCoverPicker ? "Hide photo search" : "Search Pexels for a cover photo"}
                </Button>

                <AnimatePresence>
                  {showCoverPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <Box sx={{ mt: 2 }}>
                        <PexelsCoverPicker
                          key={pexelsAutoQuery}
                          onSelect={(url) => { setValue("cover_image_url", url, { shouldValidate: true }); setShowCoverPicker(false); }}
                          border={border}
                          pri={pri}
                          isDark={isDark}
                          autoQuery={pexelsAutoQuery}
                        />
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fadeUp}>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <motion.div whileTap={buttonPress.tap} style={{ flex: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isPending}
                    sx={{ py: 1.4, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    {isPending ? (cloneData ? "Cloning…" : "Creating trip…") : (cloneData ? "Clone trip" : "Create trip")}
                  </Button>
                </motion.div>
                <Button
                  component={RouterLink}
                  to={ROUTES.trips}
                  variant="outlined"
                  sx={{ py: 1.4, px: 3, fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Cancel
                </Button>
              </Box>
            </motion.div>

          </motion.form>

          {/* ── RIGHT: Destination panel + Tips (desktop) ── */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", gap: 2 }}>
            <motion.div variants={fadeUp} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <DestinationPanel
                destination={debouncedDest}
                country={debouncedCountry}
                tripType={tripType}
                numPersons={numPersons}
                startDate={startDate}
                endDate={endDate}
                budget={budget}
                currency={currency}
                isDark={isDark}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <TripTipsCard
                tripType={tripType}
                isDark={isDark}
                border={border}
                paper={paper}
              />
            </motion.div>
          </Box>

        </Box>
      </Box>
    </motion.div>
  );
}
