import { useState } from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripService } from "../../services/trip.service";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer } from "../../theme/motion";

// ── Icons ──────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const WalletIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);
const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Adventure: "#F59E0B", Cultural: "#60A5FA", Relaxation: "#4ADE80",
  Business: "#C084FC", Family: "#FB923C", Romantic: "#F472B6",
  Solo: "#34D399", Other: "#94A3B8",
};
const STATUS_COLORS: Record<string, string> = {
  planned: "#F59E0B", ongoing: "#4ADE80", completed: "#60A5FA", cancelled: "#94A3B8",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function MetaCard({ icon: Icon, label, value, color, border, paper }: { icon: React.FC; label: string; value: string; color?: string; border: string; paper: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ p: 2, borderRadius: "12px", backgroundColor: paper, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ color: color ?? theme.palette.text.secondary, display: "flex", flexShrink: 0 }}><Icon /></Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.68rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TripDetail() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const { id }  = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const [deleteOpen, setDeleteOpen] = useState(false);

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

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 900 }}>
        <Skeleton variant="rounded" height={280} sx={{ mb: 3, borderRadius: "20px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
        <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={28} sx={{ mb: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} variant="rounded" height={68} sx={{ borderRadius: "12px" }} />)}
        </Box>
      </Box>
    );
  }

  if (error || !trip) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px", mb: 2 }}>Trip not found or you don't have access.</Alert>
        <Button component={RouterLink} to={ROUTES.trips} startIcon={<ArrowLeftIcon />} sx={{ color: sub }}>Back to trips</Button>
      </Box>
    );
  }

  const typeColor   = TYPE_COLORS[trip.trip_type] ?? "#F59E0B";
  const statusColor = STATUS_COLORS[trip.status]  ?? "#F59E0B";

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 900 }}>

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

        {/* Hero */}
        <motion.div variants={fadeUp}>
          <Box sx={{ position: "relative", borderRadius: "20px", overflow: "hidden", mb: 3.5, height: { xs: 200, md: 280 } }}>
            {trip.cover_image_url ? (
              <>
                <Box component="img" src={trip.cover_image_url} alt={trip.destination} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,11,8,0.75) 0%, transparent 55%)" }} />
              </>
            ) : (
              <Box sx={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${typeColor}22 0%, ${typeColor}55 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box sx={{ color: typeColor, opacity: 0.3 }}>
                  <GlobeIcon />
                </Box>
              </Box>
            )}
            <Box sx={{ position: "absolute", bottom: 20, left: 24, right: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <Box>
                <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "#FDFAF5", fontSize: { xs: "1.6rem", md: "2rem" }, letterSpacing: "-0.02em", lineHeight: 1.15, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                  {trip.title}
                </Typography>
                <Typography sx={{ color: "rgba(237,232,223,0.8)", fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                  {trip.destination}, {trip.country}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75 }}>
                <Box sx={{ px: 1.25, py: 0.4, borderRadius: "8px", backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: `1px solid ${statusColor}30` }}>
                  <Typography sx={{ fontSize: "0.7rem", color: statusColor, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, textTransform: "capitalize" }}>
                    {trip.status}
                  </Typography>
                </Box>
                {trip.ai_generated && (
                  <Box sx={{ px: 1.25, py: 0.4, borderRadius: "8px", backgroundColor: "rgba(245,158,11,0.85)" }}>
                    <Typography sx={{ fontSize: "0.65rem", color: "#12100A", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>✦ AI Generated</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", gap: 1.5, mb: 3.5, flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to={`${ROUTES.tripDetail(trip.id)}/edit`}
              startIcon={<EditIcon />}
              variant="outlined"
              sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.85rem" }}
            >
              Edit trip
            </Button>
            <Button
              onClick={() => setDeleteOpen(true)}
              startIcon={<TrashIcon />}
              sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.85rem", color: theme.palette.error.main, borderColor: theme.palette.error.main, "&:hover": { backgroundColor: `${theme.palette.error.main}10` }, border: "1px solid" }}
            >
              Delete
            </Button>
          </Box>
        </motion.div>

        {/* Meta cards */}
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 1.5, mb: 3.5 }}>
            <MetaCard icon={CalendarIcon} label="Start date"    value={formatDate(trip.start_date)}                       border={border} paper={paper} color={pri} />
            <MetaCard icon={CalendarIcon} label="End date"      value={formatDate(trip.end_date)}                         border={border} paper={paper} color={pri} />
            <MetaCard icon={GlobeIcon}    label="Duration"       value={`${trip.duration_days} day${trip.duration_days !== 1 ? "s" : ""}`} border={border} paper={paper} />
            <MetaCard icon={UsersIcon}    label="Travellers"     value={String(trip.num_persons)}                          border={border} paper={paper} />
            <MetaCard icon={WalletIcon}   label="Budget"         value={`${trip.currency} ${trip.budget.toLocaleString()}`} border={border} paper={paper} color={typeColor} />
            <MetaCard icon={GlobeIcon}    label="Trip type"      value={trip.trip_type}                                    border={border} paper={paper} color={typeColor} />
          </Box>
        </motion.div>

        {/* Tags */}
        {trip.tags.length > 0 && (
          <motion.div variants={fadeUp}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3.5 }}>
              {trip.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.75rem",
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    color: sub, border: `1px solid ${border}`,
                  }}
                />
              ))}
            </Box>
          </motion.div>
        )}

        {/* Itinerary placeholder */}
        <motion.div variants={fadeUp}>
          <Box sx={{ p: 3.5, borderRadius: "16px", border: `1px dashed ${border}`, backgroundColor: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)", textAlign: "center", mb: 2.5 }}>
            <Box sx={{ color: pri, display: "flex", justifyContent: "center", mb: 1.5, opacity: 0.7 }}><SparkleIcon /></Box>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.1rem", mb: 0.75 }}>
              AI day-by-day itinerary
            </Typography>
            <Typography sx={{ color: sub, fontSize: "0.83rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 2.5 }}>
              Use the AI Agent to generate a full day-by-day plan for this trip — activities, restaurants, travel times, and more.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SparkleIcon />}
              disabled
              sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.85rem" }}
            >
              Generate with AI (coming soon)
            </Button>
          </Box>
        </motion.div>

      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: isDark ? "#1A150D" : "#FDFAF5",
              border: `1px solid ${isDark ? "rgba(245,158,11,0.12)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: "16px",
              backgroundImage: "none",
            },
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary }}>
          Delete this trip?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem" }}>
            <strong style={{ color: theme.palette.text.primary }}>{trip.title}</strong> will be permanently deleted. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined" sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteTrip()}
            disabled={isDeleting}
            variant="contained"
            sx={{ backgroundColor: theme.palette.error.main, "&:hover": { backgroundColor: theme.palette.error.dark }, fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            {isDeleting ? "Deleting…" : "Delete trip"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
