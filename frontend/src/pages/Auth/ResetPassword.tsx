import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../../services/auth.service";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { ROUTES } from "../../constants/routes";
import { fadeUp, staggerContainer, buttonPress } from "../../theme/motion";
import { usePexelsPhoto } from "../../hooks/usePexelsPhoto";

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
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ShieldAlertIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const schema = z
  .object({
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path:    ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const theme   = useTheme();
  const isDark  = theme.palette.mode === "dark";
  const panelBg = theme.palette.background.default;
  const primary = theme.palette.primary.main;
  const { data: heroPhoto } = usePexelsPhoto("sunrise ocean horizon golden dawn travel");

  const iconColor = isDark ? "#7A6B5A" : "#9A7E58";
  const muteText  = isDark ? "#7A6B5A" : "#8B6B40";

  const navigate                            = useNavigate();
  const [searchParams]                      = useSearchParams();
  const token                               = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [serverError, setServerError]       = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await authService.resetPassword(token, data.password);
      navigate(ROUTES.login, { state: { passwordReset: true }, replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? "Reset failed. The link may have expired.";
      setServerError(msg);
    }
  };

  const isTokenMissing = !token;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: panelBg }}>

      {/* ── Hero panel ───────────────────────────────────────── */}
      <Box sx={{ display: { xs: "none", md: "block" }, flex: 1, position: "relative", overflow: "hidden" }}>
        <motion.div
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Box component="img" src={heroPhoto?.url_medium} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </motion.div>

        <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,11,8,0.97) 0%, rgba(13,11,8,0.3) 40%, transparent 70%)" }} />
        <Box sx={{ position: "absolute", inset: 0, background: `linear-gradient(to right, transparent 50%, ${panelBg} 100%)` }} />

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
              "A journey of a thousand miles begins with a single step."
            </Typography>
            <Typography sx={{ color: "rgba(168,146,122,0.65)", fontSize: "0.73rem", fontFamily: "Plus Jakarta Sans, sans-serif", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Lao Tzu
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

          {isTokenMissing ? (
            /* ── Invalid / missing token state ── */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ textAlign: "center" }}>
              <Box sx={{ color: theme.palette.error.main, mb: 2.5, display: "flex", justifyContent: "center" }}>
                <ShieldAlertIcon />
              </Box>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.65rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: 1.25 }}>
                Invalid reset link
              </Typography>
              <Typography sx={{ color: muteText, fontSize: "0.875rem", lineHeight: 1.6, mb: 3.5 }}>
                This link is missing or has expired. Request a new one below.
              </Typography>
              <Button
                component={RouterLink}
                to={ROUTES.forgotPassword}
                variant="contained"
                fullWidth
                sx={{ py: 1.4, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Request a new link
              </Button>
            </motion.div>
          ) : (
            /* ── Reset form ── */
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={fadeUp}>
                <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: "1.65rem", letterSpacing: "-0.01em", lineHeight: 1.2, mb: 0.75 }}>
                  Set a new password
                </Typography>
                <Typography sx={{ color: muteText, fontSize: "0.875rem", mb: 3.5, lineHeight: 1.6 }}>
                  Choose a strong password with at least 8 characters.
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
                    {...register("password")}
                    label="New password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    autoComplete="new-password"
                    autoFocus
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
                            <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small" sx={{ color: iconColor, "&:hover": { color: theme.palette.text.secondary, backgroundColor: "transparent" } }}>
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
                    {...register("confirmPassword")}
                    label="Confirm new password"
                    type={showConfirm ? "text" : "password"}
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{ mb: 3.5 }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Box sx={{ color: iconColor, display: "flex", mt: "1px" }}><LockIcon /></Box>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small" sx={{ color: iconColor, "&:hover": { color: theme.palette.text.secondary, backgroundColor: "transparent" } }}>
                              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                            </IconButton>
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
                      {isSubmitting ? "Resetting…" : "Reset password"}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>
            </motion.div>
          )}

        </Box>
      </Box>
    </Box>
  );
}
