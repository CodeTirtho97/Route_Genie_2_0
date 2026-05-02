import { useState, useEffect } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, TextField, Button, MenuItem, Chip,
  InputAdornment, Alert, LinearProgress, useTheme, CircularProgress,
  Skeleton, Autocomplete,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Compass, CalendarDays, Users, Banknote, Search, Camera, ImageIcon, Globe } from "lucide-react";
import { tripService } from "../../services/trip.service";
import { searchPexelsPhotos, type PexelsPhoto } from "../../services/pexels.service";
import { usePexelsPhoto } from "../../hooks/usePexelsPhoto";
import { DidYouKnowCard } from "../../components/features/trips/DidYouKnowCard";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer } from "../../theme/motion";
import type { TripType, TripStatus } from "../../types/trip.types";

// ── Icons ──────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ── Constants ──────────────────────────────────────────────────
const TRIP_TYPES: TripType[] = ["Adventure", "Cultural", "Relaxation", "Business", "Family", "Romantic", "Solo", "Other"];
const TRIP_STATUSES: { value: TripStatus; label: string; color: string }[] = [
  { value: "planned",   label: "Planned",   color: "#F59E0B" },
  { value: "ongoing",   label: "Ongoing",   color: "#4ADE80" },
  { value: "completed", label: "Completed", color: "#60A5FA" },
  { value: "cancelled", label: "Cancelled", color: "#94A3B8" },
];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD", "AED", "CHF"];
const SUGGESTED_TAGS = ["Beach", "Mountains", "City", "History", "Food", "Hiking", "Safari", "Luxury", "Budget", "Backpacking"];

// ── City autocomplete ──────────────────────────────────────────
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

function useDebounced<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ── Schema ─────────────────────────────────────────────────────
const schema = z.object({
  title:           z.string().min(1, "Trip title is required").max(80),
  destination:     z.string().min(1, "Destination is required"),
  country:         z.string().min(1, "Country is required"),
  start_date:      z.string().min(1, "Start date is required"),
  end_date:        z.string().min(1, "End date is required"),
  num_persons:     z.number().int().min(1, "At least 1 person"),
  trip_type:       z.string().min(1),
  status:          z.string().min(1),
  budget:          z.number().min(0, "Budget must be ≥ 0"),
  currency:        z.string().min(1),
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
}).refine((d) => !d.start_date || !d.end_date || d.end_date >= d.start_date, {
  message: "End date must be on or after start date",
  path: ["end_date"],
});
type FormData = z.infer<typeof schema>;

// ── Pexels cover picker (inline) ───────────────────────────────
function PexelsCoverPicker({ onSelect, border, fieldSx, pri, isDark }: {
  onSelect: (url: string) => void;
  border: string; fieldSx: object; pri: string; isDark: boolean;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<PexelsPhoto[]>([]);
  const [loading,  setLoading] = useState(false);

  const doSearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    setSearchQuery(searchInput.trim());
    const photos = await searchPexelsPhotos(searchInput.trim(), 6);
    setResults(photos);
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doSearch(); } }}
          label="Search Pexels"
          placeholder="e.g. Tokyo cityscape"
          size="small"
          fullWidth
          sx={fieldSx}
          slotProps={{
            input: {
              endAdornment: loading
                ? <InputAdornment position="end"><CircularProgress size={14} /></InputAdornment>
                : undefined,
            },
          }}
        />
        <Button
          onClick={doSearch}
          variant="outlined"
          size="small"
          disabled={loading || !searchInput.trim()}
          sx={{ px: 2, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", borderColor: border, color: pri, flexShrink: 0 }}
          startIcon={<Search size={13} />}
        >
          Search
        </Button>
      </Box>
      {results.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography sx={{ fontSize: "0.62rem", color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1 }}>
            Results for "{searchQuery}" · click to select
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            {results.map((p) => (
              <Box
                key={p.id}
                onClick={() => onSelect(p.url)}
                sx={{
                  aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden",
                  cursor: "pointer", border: "2px solid transparent",
                  transition: "border-color 0.15s, transform 0.15s",
                  "&:hover": { borderColor: pri, transform: "scale(1.03)" },
                }}
              >
                <Box component="img" src={p.url_medium} alt={p.alt || "photo"} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontSize: "0.58rem", color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.22)", fontFamily: "Plus Jakarta Sans, sans-serif", mt: 1 }}>
            Photos provided by Pexels
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function TripEdit() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const { id }  = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const [tags,           setTags]           = useState<string[]>([]);
  const [tagInput,       setTagInput]       = useState("");
  const [serverError,    setServerError]    = useState<string | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // City autocomplete state
  const [cityInput,       setCityInput]       = useState("");
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

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { trip_type: "Adventure", currency: "USD", num_persons: 1, budget: 0, status: "planned" },
  });

  // Load existing trip
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => tripService.get(id!),
    enabled: !!id,
  });

  // Populate form once trip data arrives
  useEffect(() => {
    if (!trip) return;
    reset({
      title:           trip.title,
      destination:     trip.destination,
      country:         trip.country,
      start_date:      trip.start_date.slice(0, 10),
      end_date:        trip.end_date.slice(0, 10),
      num_persons:     trip.num_persons,
      trip_type:       trip.trip_type,
      status:          trip.status,
      budget:          trip.budget,
      currency:        trip.currency,
      cover_image_url: trip.cover_image_url ?? "",
    });
    setCityInput(trip.destination);
    setTags(trip.tags ?? []);
  }, [trip, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      tripService.update(id!, {
        ...data,
        trip_type:       data.trip_type as TripType,
        status:          data.status as TripStatus,
        cover_image_url: data.cover_image_url || undefined,
        tags,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip", id] });
      navigate(ROUTES.tripDetail(updated.id));
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to update trip.";
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

  // Watch fields for the live preview panel
  const wTitle      = watch("title")          ?? trip?.title          ?? "";
  const wDest       = watch("destination")    ?? trip?.destination    ?? "";
  const wCountry    = watch("country")        ?? trip?.country        ?? "";
  const wStatus     = watch("status")         ?? trip?.status         ?? "planned";
  const wTripType   = watch("trip_type")      ?? trip?.trip_type      ?? "Adventure";
  const wBudget     = watch("budget")         ?? trip?.budget         ?? 0;
  const wCurrency   = watch("currency")       ?? trip?.currency       ?? "USD";
  const wStartDate  = watch("start_date")     ?? trip?.start_date     ?? "";
  const wEndDate    = watch("end_date")       ?? trip?.end_date       ?? "";
  const wNumPersons = watch("num_persons")    ?? trip?.num_persons    ?? 1;
  const wCoverUrl   = watch("cover_image_url") ?? trip?.cover_image_url ?? "";

  const pexelsQuery = `${wDest} ${wCountry} travel landscape`.trim();
  const { data: bgPhoto, isLoading: bgLoading } = usePexelsPhoto(pexelsQuery, !wCoverUrl);

  const debouncedCountry = useDebounced(wCountry, 600);

  const STATUS_COLORS: Record<string, string> = {
    planned: "#F59E0B", ongoing: "#4ADE80", completed: "#60A5FA", cancelled: "#94A3B8",
  };
  const TYPE_COLORS: Record<string, string> = {
    Adventure: "#F59E0B", Cultural: "#60A5FA", Relaxation: "#4ADE80",
    Business: "#C084FC", Family: "#FB923C", Romantic: "#F472B6",
    Solo: "#34D399", Other: "#94A3B8",
  };

  function calcDuration(start: string, end: string) {
    if (!start || !end) return null;
    const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
    return d > 0 ? d : null;
  }

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t) && tags.length < 8) setTags((prev) => [...prev, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onSubmit = (data: FormData) => {
    setServerError(null);
    mutate(data);
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

  if (tripLoading) {
    return (
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 780 }}>
        <Skeleton variant="rounded" height={40} sx={{ mb: 3, width: 160, borderRadius: "10px" }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={180} sx={{ mb: 2.5, borderRadius: "16px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
        ))}
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px", mb: 2 }}>Trip not found.</Alert>
        <Button
          component={RouterLink}
          to={ROUTES.trips}
          startIcon={<ArrowLeftIcon />}
          disableRipple
          sx={{
            color: sub,
            "&:hover": { backgroundColor: "transparent" },
            "@keyframes arrowBlink": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0 } },
            "&:hover .MuiButton-startIcon": { animation: "arrowBlink 0.8s ease-in-out infinite" },
          }}
        >Back to trips</Button>
      </Box>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1180 }}>

        {/* Back */}
        <motion.div variants={fadeUp}>
          <Button
            component={RouterLink}
            to={ROUTES.tripDetail(id!)}
            startIcon={<ArrowLeftIcon />}
            sx={{
              color: sub, fontSize: "0.8rem", textTransform: "none",
              fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3, pl: 0,
              "&:hover": { color: pri, backgroundColor: "transparent" },
              "@keyframes arrowBlink": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0 } },
              "&:hover .MuiButton-startIcon": { animation: "arrowBlink 0.8s ease-in-out infinite" },
            }}
            disableRipple
          >
            Back to trip
          </Button>
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.8rem", md: "2.2rem" }, letterSpacing: "-0.02em", mb: 0.5 }}>
            Edit trip
          </Typography>
          <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 4 }}>
            {trip.destination}, {trip.country}
          </Typography>
        </motion.div>

        {serverError && (
          <motion.div variants={fadeUp}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>{serverError}</Alert>
          </motion.div>
        )}

        {/* Two-column layout */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" }, gap: 4, alignItems: "start" }}>

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
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  sx={fieldSx}
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
                            fullWidth
                            error={!!errors.destination}
                            helperText={errors.destination?.message}
                            sx={fieldSx}
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
                        error={!!errors.country}
                        helperText={errors.country?.message}
                        sx={fieldSx}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><Compass size={15} /></Box></InputAdornment> } }}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Box>
          </motion.div>

          {/* ── Section: Schedule & People ── */}
          <motion.div variants={fadeUp}>
            <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2.5 }}>
              {sectionTitle("Schedule & people")}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                <TextField
                  {...register("start_date")}
                  label="Start date"
                  type="date"
                  fullWidth
                  error={!!errors.start_date}
                  helperText={errors.start_date?.message}
                  sx={fieldSx}
                  slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><CalendarDays size={14} /></Box></InputAdornment> } }}
                />
                <TextField
                  {...register("end_date")}
                  label="End date"
                  type="date"
                  fullWidth
                  error={!!errors.end_date}
                  helperText={errors.end_date?.message}
                  sx={fieldSx}
                  slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><CalendarDays size={14} /></Box></InputAdornment> } }}
                />
                <TextField
                  {...register("num_persons", { valueAsNumber: true })}
                  label="Travellers"
                  type="number"
                  fullWidth
                  error={!!errors.num_persons}
                  helperText={errors.num_persons?.message}
                  sx={fieldSx}
                  slotProps={{ htmlInput: { min: 1, max: 50 }, input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><Users size={14} /></Box></InputAdornment> } }}
                />
              </Box>
            </Box>
          </motion.div>

          {/* ── Section: Budget, Style & Status ── */}
          <motion.div variants={fadeUp}>
            <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2.5 }}>
              {sectionTitle("Budget, style & status")}
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 2fr 2fr" }, gap: 2 }}>
                <TextField
                  {...register("budget", { valueAsNumber: true })}
                  label="Total budget"
                  type="number"
                  fullWidth
                  error={!!errors.budget}
                  helperText={errors.budget?.message}
                  sx={fieldSx}
                  slotProps={{ htmlInput: { min: 0, step: 100 }, input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><Banknote size={14} /></Box></InputAdornment> } }}
                />
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Currency" select fullWidth sx={fieldSx}>
                      {CURRENCIES.map((c) => <MenuItem key={c} value={c} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{c}</MenuItem>)}
                    </TextField>
                  )}
                />
                <Controller
                  name="trip_type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Trip type" select fullWidth sx={fieldSx}>
                      {TRIP_TYPES.map((t) => (
                        <MenuItem key={t} value={t} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{t}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Status" select fullWidth sx={fieldSx}>
                      {TRIP_STATUSES.map(({ value, label, color }) => (
                        <MenuItem key={value} value={value} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                            {label}
                          </Box>
                        </MenuItem>
                      ))}
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
                label="Add a custom tag"
                placeholder="e.g. Honeymoon"
                size="small"
                fullWidth
                sx={fieldSx}
              />
            </Box>
          </motion.div>

          {/* ── Section: Cover Image ── */}
          <motion.div variants={fadeUp}>
            <Box sx={{ p: 3, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 3 }}>
              {sectionTitle("Cover image")}
              <Controller
                name="cover_image_url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Image URL"
                    placeholder="https://…"
                    fullWidth
                    error={!!errors.cover_image_url}
                    helperText={errors.cover_image_url?.message}
                    sx={{ ...fieldSx, mb: 2 }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box sx={{ color: sub, display: "flex" }}><ImageIcon size={14} /></Box></InputAdornment> } }}
                  />
                )}
              />

              {/* Current cover preview */}
              {trip.cover_image_url && (
                <Box sx={{ borderRadius: "10px", overflow: "hidden", height: 120, mb: 2 }}>
                  <Box component="img" src={trip.cover_image_url} alt="current cover" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
              )}

              <Button
                size="small"
                variant="outlined"
                startIcon={<Camera size={13} />}
                onClick={() => setShowCoverPicker((v) => !v)}
                sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.78rem", borderColor: border, color: sub, textTransform: "none", mb: showCoverPicker ? 2 : 0 }}
              >
                {showCoverPicker ? "Hide Pexels search" : "Search Pexels for a cover"}
              </Button>

              {showCoverPicker && (
                <PexelsCoverPicker
                  onSelect={(url) => { setValue("cover_image_url", url, { shouldValidate: true }); setShowCoverPicker(false); }}
                  border={border}
                  fieldSx={fieldSx}
                  pri={pri}
                  isDark={isDark}
                />
              )}
            </Box>
          </motion.div>

          {/* Submit */}
          <motion.div variants={fadeUp}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                component={RouterLink}
                to={ROUTES.tripDetail(id!)}
                variant="outlined"
                sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", borderColor: border, color: sub }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isPending}
                sx={{ px: 4, py: 1.3, fontSize: "0.92rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </Box>
          </motion.div>

        </motion.form>

        {/* ── RIGHT: Preview panel (desktop) ── */}
        <Box sx={{ display: { xs: "none", lg: "block" }, position: "sticky", top: 24 }}>

          {/* Cover photo */}
          <motion.div variants={fadeUp}>
            <Box
              sx={{
                borderRadius: "20px", overflow: "hidden", height: 280, mb: 2,
                border: `1px solid ${border}`, position: "relative",
                backgroundColor: isDark ? "#111827" : "#1a1206",
              }}
            >
              <AnimatePresence mode="wait">
                {(wCoverUrl || bgPhoto) ? (
                  <motion.div
                    key={wCoverUrl || bgPhoto?.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ position: "absolute", inset: 0 }}
                  >
                    <Box
                      component="img"
                      src={wCoverUrl || bgPhoto?.url_medium}
                      alt={wDest || "cover"}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </motion.div>
                ) : bgLoading ? (
                  <Box key="loader" sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress size={22} sx={{ color: "rgba(255,255,255,0.2)" }} />
                  </Box>
                ) : (
                  <Box key="empty" sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.18 }}>
                    <Globe size={40} style={{ color: "#fff" }} />
                  </Box>
                )}
              </AnimatePresence>
              {/* Gradient overlay */}
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,18,0.85) 0%, rgba(8,8,18,0.2) 55%, transparent 100%)", zIndex: 2 }} />
              {/* Bottom metadata */}
              <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 2.25, zIndex: 3 }}>
                {wTitle && (
                  <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "#FDFAF5", fontSize: "1.15rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: 0.5, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                    {wTitle}
                  </Typography>
                )}
                {wDest && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MapPin size={11} style={{ color: "rgba(253,250,245,0.5)" }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "rgba(253,250,245,0.55)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {[wDest, wCountry].filter(Boolean).join(", ")}
                    </Typography>
                  </Box>
                )}
                {bgPhoto && !wCoverUrl && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75 }}>
                    <Camera size={8} style={{ color: "rgba(255,255,255,0.2)" }} />
                    <Typography sx={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.2)", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Photo by {bgPhoto.photographer} · Pexels
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>

          {/* Trip snapshot card */}
          <motion.div variants={fadeUp}>
            <Box sx={{ p: 2.5, borderRadius: "16px", backgroundColor: paper, border: `1px solid ${border}`, mb: 2 }}>
              <Typography sx={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.75 }}>
                Trip Snapshot
              </Typography>

              {/* Status + type row */}
              <Box sx={{ display: "flex", gap: 0.75, mb: 1.75, flexWrap: "wrap" }}>
                <Box sx={{ px: 1, py: 0.35, borderRadius: "6px", backgroundColor: `${STATUS_COLORS[wStatus] ?? "#F59E0B"}18`, border: `1px solid ${STATUS_COLORS[wStatus] ?? "#F59E0B"}30` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: STATUS_COLORS[wStatus] ?? "#F59E0B" }} />
                    <Typography sx={{ fontSize: "0.68rem", color: STATUS_COLORS[wStatus] ?? "#F59E0B", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, textTransform: "capitalize" }}>
                      {wStatus}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ px: 1, py: 0.35, borderRadius: "6px", backgroundColor: `${TYPE_COLORS[wTripType] ?? "#F59E0B"}12`, border: `1px solid ${TYPE_COLORS[wTripType] ?? "#F59E0B"}25` }}>
                  <Typography sx={{ fontSize: "0.68rem", color: TYPE_COLORS[wTripType] ?? "#F59E0B", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>
                    {wTripType}
                  </Typography>
                </Box>
              </Box>

              {/* Detail rows */}
              {[
                { label: "Duration", value: calcDuration(wStartDate, wEndDate) ? `${calcDuration(wStartDate, wEndDate)} days` : "—" },
                { label: "Travellers", value: wNumPersons ? String(wNumPersons) : "—" },
                { label: "Budget", value: wBudget > 0 ? `${wCurrency} ${wBudget.toLocaleString()}` : "—" },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.85, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, "&:last-child": { borderBottom: "none" } }}>
                  <Typography sx={{ fontSize: "0.72rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{label}</Typography>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{value}</Typography>
                </Box>
              ))}

              {/* Budget progress bar (if budget is set) */}
              {wBudget > 0 && (
                <Box sx={{ mt: 1.25 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((wBudget / (wBudget * 1.5)) * 100, 100)}
                    sx={{
                      height: 3, borderRadius: "2px",
                      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: TYPE_COLORS[wTripType] ?? "#F59E0B",
                        borderRadius: "2px",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          </motion.div>

          {/* Did You Know */}
          <DidYouKnowCard
            country={debouncedCountry}
            isDark={isDark}
            border={border}
            paper={paper}
          />

        </Box>
        {/* End two-column grid */}
        </Box>

      </Box>
    </motion.div>
  );
}
