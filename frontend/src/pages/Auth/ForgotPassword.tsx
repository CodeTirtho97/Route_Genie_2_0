import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, TextField, Button, Link, Alert,
  InputAdornment, useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../../services/auth.service";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer, buttonPress } from "../../theme/motion";

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

// Misty forest path — "finding your way back"
const HERO_IMAGE = "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1400&q=90";

export default function ForgotPassword() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const panelBg = theme.palette.background.default;
  const primary = theme.palette.primary.main;

  const iconColor  = isDark ? "#7A6B5A" : "#9A7E58";
  const muteText   = isDark ? "#7A6B5A" : "#8B6B40";

  const [sent, setSent]               = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: panelBg }}>

      {/* ── Hero panel ───────────────────────────────────────── */}
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
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,11,8,0.97) 0%, rgba(13,11,8,0.3) 40%, transparent 70%)" }} />
        {isDark && (
          <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(to right, transparent 55%, ${panelBg} 100%)` }} />
        )}

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

        <motion.div
          style={{ position: "absolute", bottom: 52, left: 40, right: 56 }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Box sx={{ borderLeft: "2.5px solid rgba(245,158,11,0.6)", pl: 2.5 }}>
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "rgba(237,232,223,0.9)", fontSize: "1.1rem", lineHeight: 1.65, mb: 1.25 }}>
              "Not all those who wander are lost."
            </Typography>
            <Typography sx={{ color: "rgba(168,146,122,0.65)", fontSize: "0.73rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              J.R.R. Tolkien
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

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Confirmation state ── */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: "center" }}
              >
                <Box sx={{ color: primary, mb: 2.5, display: "flex", justifyContent: "center" }}>
                  <CheckCircleIcon />
                </Box>
                <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.65rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: 1.25 }}>
                  Check your inbox
                </Typography>
                <Typography sx={{ color: muteText, fontSize: "0.875rem", lineHeight: 1.6, mb: 3.5 }}>
                  We sent a reset link to{" "}
                  <Box component="span" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                    {getValues("email")}
                  </Box>
                  . It expires in 15 minutes.
                </Typography>
                <Typography sx={{ color: muteText, fontSize: "0.8rem", lineHeight: 1.6 }}>
                  Didn't receive it? Check your spam folder, or{" "}
                  <Link
                    component="button"
                    onClick={() => setSent(false)}
                    sx={{ color: theme.palette.text.secondary, fontWeight: 600, textDecoration: "none", "&:hover": { color: primary }, transition: "color 0.2s", cursor: "pointer", background: "none", border: "none", font: "inherit" }}
                  >
                    try again
                  </Link>
                  .
                </Typography>
                <Button
                  component={RouterLink}
                  to={ROUTES.login}
                  variant="outlined"
                  fullWidth
                  startIcon={<ArrowLeftIcon />}
                  sx={{ mt: 4, py: 1.4, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Back to sign in
                </Button>
              </motion.div>
            ) : (
              /* ── Request form ── */
              <motion.div key="form" variants={staggerContainer} initial="hidden" animate="visible">
                <motion.div variants={fadeUp}>
                  <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.65rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: 0.75 }}>
                    Forgot your password?
                  </Typography>
                  <Typography sx={{ color: muteText, fontSize: "0.875rem", mb: 3.5, lineHeight: 1.6 }}>
                    Enter your email and we'll send you a reset link. Back to{" "}
                    <Link
                      component={RouterLink}
                      to={ROUTES.login}
                      sx={{ color: theme.palette.text.secondary, fontWeight: 600, textDecoration: "none", "&:hover": { color: primary }, transition: "color 0.2s" }}
                    >
                      sign in
                    </Link>
                    .
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
                  <motion.div variants={fadeUp}>
                    <TextField
                      {...register("email")}
                      label="Email address"
                      type="email"
                      fullWidth
                      autoComplete="email"
                      autoFocus
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      sx={{ mb: 3.5 }}
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
                    <motion.div whileTap={buttonPress.tap}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isSubmitting}
                        sx={{ py: 1.4, fontSize: "0.92rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.02em" }}
                      >
                        {isSubmitting ? "Sending…" : "Send reset link"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

        </Box>
      </Box>
    </Box>
  );
}
