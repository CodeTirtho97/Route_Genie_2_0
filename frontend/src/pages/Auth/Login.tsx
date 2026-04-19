import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, TextField, Button, Link, Alert,
  InputAdornment, IconButton, useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
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

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

const HERO_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=90";

const STATS = [
  { value: "10k+", label: "Trips planned" },
  { value: "50+",  label: "Countries"    },
  { value: "4.9★", label: "Rating"       },
];

export default function Login() {
  const theme     = useTheme();
  const isDark    = theme.palette.mode === "dark";
  const panelBg   = theme.palette.background.default;
  const primary   = theme.palette.primary.main;

  // Mode-aware colour tokens
  const iconColor    = isDark ? "#7A6B5A" : "#9A7E58";
  const muteText     = isDark ? "#7A6B5A" : "#8B6B40";
  const dimText      = isDark ? "#4A3E30" : "#B09070";
  const separator    = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)";
  const statBg       = isDark ? "rgba(245,158,11,0.05)"  : "rgba(122,78,0,0.04)";
  const statBorder   = isDark ? "rgba(245,158,11,0.14)"  : "rgba(122,78,0,0.14)";
  const statGlow     = isDark
    ? "0 0 18px rgba(245,158,11,0.14), 0 1px 0 rgba(245,158,11,0.08) inset"
    : "0 0 14px rgba(122,78,0,0.1),   0 1px 0 rgba(122,78,0,0.06) inset";

  const navigate = useNavigate();
  const location = useLocation();
  const { login: storeLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError]   = useState<string | null>(null);
  const passwordReset = (location.state as { passwordReset?: boolean })?.passwordReset ?? false;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.dashboard;

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await authService.login(data);
      storeLogin(res.user, res.access_token, res.refresh_token);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? "Login failed. Please try again.";
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

        {/* Vignette + bottom dark + right edge fades to form panel */}
        <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,11,8,0.97) 0%, rgba(13,11,8,0.3) 40%, transparent 70%)" }} />
        {/* Right edge — seamless in dark, clean border in light */}
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

        {/* Editorial quote */}
        <motion.div
          style={{ position: "absolute", bottom: 52, left: 40, right: 56 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Box sx={{ borderLeft: "2.5px solid rgba(245,158,11,0.6)", pl: 2.5 }}>
            <Typography sx={{
              fontFamily: '"DM Serif Display", serif',
              color:      "rgba(237,232,223,0.9)",
              fontSize:   "1.1rem",
              lineHeight: 1.65,
              mb:         1.25,
            }}>
              "The world is a book, and those who do not travel read only one page."
            </Typography>
            <Typography sx={{ color: "rgba(168,146,122,0.65)", fontSize: "0.73rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Saint Augustine
            </Typography>
          </Box>
        </motion.div>
      </Box>

      {/* ── Form panel ───────────────────────────────────────── */}
      <Box sx={{
        flex:            { xs: 1, md: "0 0 460px" },
        display:         "flex",
        flexDirection:   "column",
        justifyContent:  "center",
        alignItems:      "center",
        px:              { xs: 4, sm: 7 },
        py:              6,
        backgroundColor: panelBg,
        position:        "relative",
        boxShadow:       isDark ? "none" : "-12px 0 40px rgba(0,0,0,0.07)",
        backgroundImage: isDark ? "none" : "radial-gradient(ellipse at 25% 20%, rgba(245,158,11,0.06) 0%, transparent 60%)",
      }}>

        {/* Theme toggle — top right of panel */}
        <Box sx={{ position: "absolute", top: 24, right: 24 }}>
          <ThemeToggle />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 360 }}>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ textAlign: "center", marginBottom: 44 }}
          >
            <Box component={RouterLink} to={ROUTES.home} sx={{ display: "inline-block", lineHeight: 0, mb: 1.5 }}>
              <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 64, width: "auto", transition: "opacity 0.2s", "&:hover": { opacity: 0.8 } }} />
            </Box>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: primary, fontSize: "2.2rem", lineHeight: 1, letterSpacing: "-0.01em", mb: 1.75 }}>
              RouteGenie
            </Typography>
            <Box sx={{ width: 40, height: "1px", background: `linear-gradient(to right, transparent, ${primary}BF, transparent)`, mx: "auto", mb: 1.75 }} />
            <Typography sx={{ color: muteText, fontSize: "0.63rem", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              AI Travel Intelligence
            </Typography>
          </motion.div>

          {/* Form */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">

            <motion.div variants={fadeUp}>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.65rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: 0.75 }}>
                Welcome back
              </Typography>
              <Typography sx={{ color: muteText, fontSize: "0.875rem", mb: 3.5, lineHeight: 1.5 }}>
                No account yet?{" "}
                <Link
                  component={RouterLink}
                  to={ROUTES.signup}
                  sx={{ color: theme.palette.text.secondary, fontWeight: 600, textDecoration: "none", "&:hover": { color: primary }, transition: "color 0.2s" }}
                >
                  Sign up free
                </Link>
              </Typography>
            </motion.div>

            <AnimatePresence>
              {passwordReset && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Alert severity="success" sx={{ mb: 2.5, borderRadius: "8px", fontSize: "0.85rem" }}>
                    Password reset successfully. Sign in with your new password.
                  </Alert>
                </motion.div>
              )}
              {serverError && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px", fontSize: "0.85rem" }}>
                    {serverError}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form onSubmit={handleSubmit(onSubmit)}>
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
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 1 }}
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
                <Box sx={{ textAlign: "right", mb: 3.5 }}>
                  <Typography
                    component={RouterLink}
                    to={ROUTES.forgotPassword}
                    sx={{ color: muteText, fontSize: "0.8rem", textDecoration: "none", "&:hover": { color: primary }, transition: "color 0.2s" }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
              </motion.div>

              <motion.div variants={fadeUp}>
                <motion.div whileTap={buttonPress.tap}>
                  <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}
                    sx={{ py: 1.4, fontSize: "0.92rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.02em" }}
                  >
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.form>

            {/* Stats row */}
            <motion.div variants={fadeUp}>
              <Box sx={{
                display:    "flex",
                alignItems: "center",
                mt:         5,
                pt:         4,
                borderTop:  `1px solid ${separator}`,
                gap:        1,
              }}>
                {STATS.map((stat, i) => (
                  <Box
                    key={stat.label}
                    sx={{
                      flex:            1,
                      textAlign:       "center",
                      py:              1.25,
                      px:              0.5,
                      borderRadius:    "10px",
                      backgroundColor: statBg,
                      border:          `1px solid ${statBorder}`,
                      boxShadow:       statGlow,
                      position:        "relative",
                      transition:      "box-shadow 0.25s ease",
                      "&:hover": {
                        boxShadow: isDark
                          ? "0 0 28px rgba(245,158,11,0.22), 0 1px 0 rgba(245,158,11,0.12) inset"
                          : "0 0 22px rgba(122,78,0,0.16),   0 1px 0 rgba(122,78,0,0.1)  inset",
                      },
                      // Vertical divider between cards via margin
                      ...(i > 0 ? { ml: 0 } : {}),
                    }}
                  >
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: dimText, fontSize: "0.63rem", letterSpacing: "0.04em", mt: 0.25 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
