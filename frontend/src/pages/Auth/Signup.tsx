import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, TextField, Button, Link, Alert,
  MenuItem, InputAdornment, IconButton, Grid, useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { LegalModal } from "../../components/ui/LegalModal";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer, buttonPress } from "../../theme/motion";

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const schema = z.object({
  name:     z.string().min(2, "At least 2 characters"),
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  dob:      z.string().min(1, "Required"),
  gender:   z.enum(["Male", "Female", "Other", "Prefer not to say"], { error: "Select a gender" }),
});
type FormData = z.infer<typeof schema>;

const HERO_IMAGE = "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=90";

const PERKS = [
  { heading: "Itinerary Builder with AI",  body: "Day-by-day plans generated in seconds"             },
  { heading: "Booking Tracker",       body: "Flights, hotels, and activities in one place"       },
  { heading: "Live Travel Data",      body: "Weather forecasts and exchange rates, always fresh" },
];

export default function Signup() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const panelBg = theme.palette.background.default;
  const primary = theme.palette.primary.main;

  const iconColor = isDark ? "#7A6B5A" : "#9A7E58";
  const muteText  = isDark ? "#7A6B5A" : "#8B6B40";

  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError]   = useState<string | null>(null);
  const [legalModal, setLegalModal]     = useState<"terms" | "privacy" | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await authService.register(data);
      storeLogin(res.user, res.access_token, res.refresh_token);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? "Registration failed. Please try again.";
      setServerError(msg);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: panelBg }}>

      {/* ── Hero panel — always cinematic dark ───────────────── */}
      <Box sx={{ display: { xs: "none", md: "block" }, flex: 1, position: "relative", overflow: "hidden", borderRight: isDark ? "none" : "1px solid rgba(180,140,80,0.15)" }}>
        <motion.div
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Box component="img" src={HERO_IMAGE} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </motion.div>

        <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,11,8,0.97) 0%, rgba(13,11,8,0.3) 45%, transparent 70%)" }} />
        {isDark && (
          <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(to right, transparent 55%, ${panelBg} 100%)` }} />
        )}

        {/* Brand watermark */}
        <motion.div
          style={{ position: "absolute", top: 28, left: 32 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Box component={RouterLink} to={ROUTES.home} sx={{ display: "block", lineHeight: 0 }}>
            <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 40, width: "auto", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))", transition: "opacity 0.2s", "&:hover": { opacity: 0.8 } }} />
          </Box>
        </motion.div>

        {/* Hero copy + perks */}
        <Box sx={{ position: "absolute", bottom: 52, left: 40, right: 56 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "#EDE8DF", fontSize: "2rem", lineHeight: 1.3, mb: 0.75, letterSpacing: "-0.01em" }}>
              Plan less.{" "}
              <Box component="span" sx={{ color: "#F59E0B" }}>Explore more.</Box>
            </Typography>
            <Typography sx={{ color: "#7A6B5A", fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 4, lineHeight: 1.6 }}>
              Join thousands of travellers building smarter trips with AI.
            </Typography>
          </motion.div>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.heading}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.15, duration: 0.6, ease: "easeOut" }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Box sx={{ width: 5, height: 5, mt: "7px", borderRadius: "50%", backgroundColor: "#F59E0B", flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ color: "#C4A882", fontSize: "0.85rem", fontWeight: 600, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.3 }}>
                      {perk.heading}
                    </Typography>
                    <Typography sx={{ color: "#5C4F3E", fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.5 }}>
                      {perk.body}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Form panel ───────────────────────────────────────── */}
      <Box sx={{
        flex:            { xs: 1, md: "0 0 500px" },
        display:         "flex",
        flexDirection:   "column",
        justifyContent:  "center",
        alignItems:      "center",
        px:              { xs: 4, sm: 7 },
        py:              5,
        backgroundColor: panelBg,
        overflowY:       "auto",
        position:        "relative",
        boxShadow:       isDark ? "none" : "-12px 0 40px rgba(0,0,0,0.07)",
        backgroundImage: isDark ? "none" : "radial-gradient(ellipse at 25% 20%, rgba(245,158,11,0.06) 0%, transparent 60%)",
      }}>

        {/* Theme toggle */}
        <Box sx={{ position: "absolute", top: 24, right: 24 }}>
          <ThemeToggle />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 380 }}>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ textAlign: "center", marginBottom: 40 }}
          >
            <Box component={RouterLink} to={ROUTES.home} sx={{ display: "inline-block", lineHeight: 0, mb: 1.25 }}>
              <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 64, width: "auto", transition: "opacity 0.2s", "&:hover": { opacity: 0.8 } }} />
            </Box>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: primary, fontSize: "2.2rem", lineHeight: 1, letterSpacing: "-0.01em", mb: 1.5 }}>
              RouteGenie
            </Typography>
            <Box sx={{ width: 40, height: "1px", background: `linear-gradient(to right, transparent, ${primary}BF, transparent)`, mx: "auto", mb: 1.75 }} />
            <Typography sx={{ color: muteText, fontSize: "0.63rem", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              AI Travel Intelligence
            </Typography>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible">

            <motion.div variants={fadeUp}>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.65rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: 0.75 }}>
                Create your account
              </Typography>
              <Typography sx={{ color: muteText, fontSize: "0.875rem", mb: 3.5, lineHeight: 1.5 }}>
                Already have one?{" "}
                <Link
                  component={RouterLink}
                  to={ROUTES.login}
                  sx={{ color: theme.palette.text.secondary, fontWeight: 600, textDecoration: "none", "&:hover": { color: primary }, transition: "color 0.2s" }}
                >
                  Sign in
                </Link>
              </Typography>
            </motion.div>

            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px", fontSize: "0.85rem" }}>
                    {serverError}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form onSubmit={handleSubmit(onSubmit)}>

              {/* Name + Gender */}
              <motion.div variants={fadeUp}>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid size={7}>
                    <TextField
                      {...register("name")}
                      label="Full name"
                      fullWidth
                      autoComplete="name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box sx={{ color: iconColor, display: "flex", mt: "1px" }}><PersonIcon /></Box>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={5}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          label="Gender"
                          fullWidth
                          error={!!errors.gender}
                          helperText={errors.gender?.message}
                        >
                          {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                            <MenuItem key={g} value={g} sx={{ fontSize: "0.875rem" }}>{g}</MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </motion.div>

              <motion.div variants={fadeUp}>
                <TextField
                  {...register("email")}
                  label="Email"
                  type="email"
                  fullWidth
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ color: iconColor, display: "flex", mt: "1px" }}><MailIcon /></Box>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <TextField
                  {...register("password")}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 2 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ color: iconColor, display: "flex", mt: "1px" }}><LockIcon /></Box>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((v) => !v)}
                            edge="end"
                            size="small"
                            sx={{ color: iconColor, "&:hover": { color: theme.palette.text.secondary, backgroundColor: "transparent" } }}
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <TextField
                  {...register("dob")}
                  label="Date of birth"
                  type="date"
                  fullWidth
                  error={!!errors.dob}
                  helperText={errors.dob?.message}
                  sx={{ mb: 3 }}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ color: iconColor, display: "flex", mt: "1px" }}><CalendarIcon /></Box>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <motion.div whileTap={buttonPress.tap}>
                  <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}
                    sx={{ py: 1.4, fontSize: "0.92rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.02em" }}
                  >
                    {isSubmitting ? "Creating account…" : "Create account"}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Typography sx={{ textAlign: "center", color: muteText, fontSize: "0.72rem", mt: 2.5, lineHeight: 1.6, opacity: 0.7 }}>
                  By continuing you agree to our{" "}
                  <Box component="span" onClick={() => setLegalModal("terms")} sx={{ cursor: "pointer", "&:hover": { color: primary }, transition: "color 0.2s" }}>Terms</Box>
                  {" "}and{" "}
                  <Box component="span" onClick={() => setLegalModal("privacy")} sx={{ cursor: "pointer", "&:hover": { color: primary }, transition: "color 0.2s" }}>Privacy Policy</Box>
                </Typography>
              </motion.div>
            </motion.form>
          </motion.div>
        </Box>
      </Box>

      {legalModal && (
        <LegalModal
          open={!!legalModal}
          type={legalModal}
          onClose={() => setLegalModal(null)}
        />
      )}
    </Box>
  );
}
