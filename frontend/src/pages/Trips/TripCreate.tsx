import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, TextField, Button, MenuItem, Chip,
  InputAdornment, Alert, useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tripService } from "../../services/trip.service";
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

export default function TripCreate() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const [tags, setTags]         = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { trip_type: "Adventure", currency: "USD", num_persons: 1, budget: 0 },
  });

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
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onSubmit = (data: FormData) => {
    setServerError(null);
    mutate({
      ...data,
      trip_type: data.trip_type as TripCreate["trip_type"],
      cover_image_url: data.cover_image_url || undefined,
      tags,
    });
  };

  const sectionTitle = (label: string) => (
    <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, mb: 2 }}>
      {label}
    </Typography>
  );

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 720 }}>

        {/* Back */}
        <motion.div variants={fadeUp}>
          <Button
            component={RouterLink}
            to={ROUTES.trips}
            startIcon={<ArrowLeftIcon />}
            sx={{ color: sub, fontSize: "0.8rem", textTransform: "none", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 3, pl: 0, "&:hover": { color: pri } }}
          >
            Back to trips
          </Button>
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.8rem", md: "2.2rem" }, letterSpacing: "-0.02em", mb: 0.5 }}>
            Plan a new trip
          </Typography>
          <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 4 }}>
            Fill in the details below. You can always edit them later.
          </Typography>
        </motion.div>

        {serverError && (
          <motion.div variants={fadeUp}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>{serverError}</Alert>
          </motion.div>
        )}

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
                  <TextField
                    {...register("destination")}
                    label="City / Region"
                    fullWidth
                    placeholder="e.g. Kyoto"
                    error={!!errors.destination}
                    helperText={errors.destination?.message}
                  />
                  <TextField
                    {...register("country")}
                    label="Country"
                    fullWidth
                    placeholder="e.g. Japan"
                    error={!!errors.country}
                    helperText={errors.country?.message}
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
                  slotProps={{ htmlInput: { min: 0, step: 100 } }}
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
                      {TRIP_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
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
              <TextField
                {...register("cover_image_url")}
                label="Image URL"
                fullWidth
                placeholder="https://images.unsplash.com/..."
                error={!!errors.cover_image_url}
                helperText={errors.cover_image_url?.message ?? "Paste any direct image URL from Unsplash or similar"}
              />
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
                  {isPending ? "Creating trip…" : "Create trip"}
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
      </Box>
    </motion.div>
  );
}
