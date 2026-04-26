import { useState } from "react";
import {
  Box, Typography, Avatar, Button, TextField, MenuItem,
  Alert, Chip, useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User, Settings, Lock, Check, Globe, MapPin, Calendar,
  Shield, Compass,
} from "lucide-react";
import { authService } from "../../services/auth.service";
import { tripService } from "../../services/trip.service";
import { useAuthStore } from "../../store/auth.store";
import { fadeUp, staggerContainer } from "../../theme/motion";

// ── Constants ─────────────────────────────────────────────────
const GENDERS    = ["Male", "Female", "Other", "Prefer not to say"] as const;
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD", "AED", "CHF"];
const TRAVEL_STYLES = ["Adventure", "Cultural", "Relaxation", "Business", "Family", "Romantic", "Solo", "Luxury", "Budget", "Backpacking"];
const TABS = ["Personal Info", "Preferences", "Security"] as const;
type Tab = typeof TABS[number];

// ── Schemas ───────────────────────────────────────────────────
const profileSchema = z.object({
  name:       z.string().min(1, "Name is required"),
  dob:        z.string().min(1, "Date of birth is required"),
  gender:     z.string().min(1),
  avatar_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
const prefSchema = z.object({
  preferred_currency: z.string().min(1),
  home_country:       z.string().optional(),
});
const pwSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password:     z.string().min(8, "At least 8 characters"),
  confirm_password: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});
type ProfileForm = z.infer<typeof profileSchema>;
type PrefForm    = z.infer<typeof prefSchema>;
type PwForm      = z.infer<typeof pwSchema>;

// ── Right-panel helpers ───────────────────────────────────────
function InfoRow({ label, value, muted }: { label: string; value?: string | null; muted?: boolean }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, py: 1, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, "&:last-child": { borderBottom: "none" } }}>
      <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif", flexShrink: 0, whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: "0.82rem", fontWeight: 600, textAlign: "right",
        color: value ? (isDark ? "#D4C4A0" : "#2C1810") : theme.palette.text.disabled,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        opacity: muted ? 0.55 : 1,
      }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

function SideSection({ title, Icon, children, border, paper }: {
  title: string;
  Icon: React.FC<{ size?: number }>;
  children: React.ReactNode;
  border: string;
  paper: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ p: 2.5, borderRadius: "14px", backgroundColor: paper, border: `1px solid ${border}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box sx={{ color: isDark ? "#7A6B5A" : "#9A7E58" }}><Icon size={13} /></Box>
        <Typography sx={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: theme.palette.text.secondary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Profile() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user, setUser } = useAuthStore();
  const qc     = useQueryClient();

  const paper  = theme.palette.background.paper;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const pri    = theme.palette.primary.main;
  const sub    = theme.palette.text.secondary;

  const [activeTab,    setActiveTab]    = useState<Tab>("Personal Info");
  const [profileMsg,   setProfileMsg]   = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [prefMsg,      setPrefMsg]      = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg,        setPwMsg]        = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [travelStyles, setTravelStyles] = useState<string[]>(user?.preferences?.travel_styles ?? []);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const { data: tripsData } = useQuery({
    queryKey: ["trips"],
    queryFn: () => tripService.list({ limit: 100 }),
  });
  const totalTrips  = tripsData?.total ?? 0;
  const countries   = new Set(tripsData?.data.map((t) => t.country) ?? []).size;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";
  const dobDisplay = user?.dob
    ? new Date(user.dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : undefined;

  // ── Forms ────────────────────────────────────────────────────
  const { control: pc, handleSubmit: hsp, formState: { errors: pe } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", dob: user?.dob?.slice(0, 10) ?? "", gender: user?.gender ?? "Prefer not to say", avatar_url: user?.avatar_url ?? "" },
  });
  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => authService.updateMe({ ...data, avatar_url: data.avatar_url || null }),
    onSuccess: (updated) => { setUser(updated); setProfileMsg({ type: "success", text: "Profile updated." }); qc.invalidateQueries({ queryKey: ["me"] }); },
    onError: (e: any) => setProfileMsg({ type: "error", text: e?.response?.data?.detail ?? "Update failed" }),
  });

  const { control: prefc, handleSubmit: hspref, formState: { errors: prefe } } = useForm<PrefForm>({
    resolver: zodResolver(prefSchema),
    defaultValues: { preferred_currency: user?.preferences?.preferred_currency ?? "USD", home_country: user?.preferences?.home_country ?? "" },
  });
  const prefMutation = useMutation({
    mutationFn: (data: PrefForm) => authService.updatePreferences({ ...data, travel_styles: travelStyles, home_country: data.home_country || null }),
    onSuccess: () => setPrefMsg({ type: "success", text: "Preferences saved." }),
    onError: (e: any) => setPrefMsg({ type: "error", text: e?.response?.data?.detail ?? "Update failed" }),
  });

  const { control: pwc, handleSubmit: hspw, reset: resetPw, formState: { errors: pwe } } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });
  const pwMutation = useMutation({
    mutationFn: (data: PwForm) => authService.changePassword({ current_password: data.current_password, new_password: data.new_password }),
    onSuccess: () => { setPwMsg({ type: "success", text: "Password changed." }); resetPw(); },
    onError: (e: any) => setPwMsg({ type: "error", text: e?.response?.data?.detail ?? "Failed to change password" }),
  });

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

  const TAB_ICONS: Record<Tab, React.FC<{ size?: number }>> = {
    "Personal Info": User,
    "Preferences": Settings,
    "Security": Lock,
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Box sx={{ p: { xs: 3, md: 4 }, maxWidth: 1200 }}>

        {/* Page title */}
        <motion.div variants={fadeUp}>
          <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: theme.palette.text.primary, fontSize: { xs: "1.8rem", md: "2.1rem" }, letterSpacing: "-0.02em", mb: 4 }}>
            Profile & Settings
          </Typography>
        </motion.div>

        {/* Two-column grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" }, gap: 3.5, alignItems: "start" }}>

          {/* ── LEFT: edit forms ─────────────────────────────── */}
          <motion.div variants={fadeUp}>
          <Box sx={{ backgroundColor: paper, borderRadius: "16px", border: `1px solid ${border}`, p: 3 }}>

            {/* Tab nav */}
            <Box sx={{ display: "flex", gap: 0.5, mb: 3.5, borderBottom: `1px solid ${border}` }}>
              {TABS.map((tab) => {
                const active = activeTab === tab;
                const Icon = TAB_ICONS[tab];
                return (
                  <Box
                    key={tab}
                    component="button"
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.9,
                      px: 2.25, py: 1.1, border: "none", background: "transparent", cursor: "pointer",
                      borderRadius: "8px 8px 0 0",
                      fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.875rem",
                      fontWeight: active ? 700 : 400,
                      color: active ? pri : sub,
                      borderBottom: active ? `2px solid ${pri}` : "2px solid transparent",
                      mb: "-1px",
                      transition: "color 0.15s",
                      "&:hover": { color: active ? pri : theme.palette.text.primary },
                    }}
                  >
                    <Icon size={13} />
                    {tab}
                  </Box>
                );
              })}
            </Box>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {/* ── Personal Info ─────────────────────── */}
                {activeTab === "Personal Info" && (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontFamily: '"DM Serif Display", serif', fontSize: "1.25rem", color: theme.palette.text.primary, mb: 0.4 }}>
                        Personal Information
                      </Typography>
                      <Typography sx={{ fontSize: "0.83rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        Update your display name, date of birth, and avatar.
                      </Typography>
                    </Box>
                    <Box component="form" onSubmit={hsp((d) => { setProfileMsg(null); profileMutation.mutate(d); })} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      {profileMsg && (
                        <Alert severity={profileMsg.type} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.825rem", borderRadius: "10px" }}>{profileMsg.text}</Alert>
                      )}
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <Controller name="name" control={pc} render={({ field }) => (
                          <TextField {...field} label="Full Name" error={!!pe.name} helperText={pe.name?.message} sx={fieldSx} />
                        )} />
                        <Controller name="gender" control={pc} render={({ field }) => (
                          <TextField {...field} select label="Gender" sx={fieldSx}>
                            {GENDERS.map((g) => <MenuItem key={g} value={g} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{g}</MenuItem>)}
                          </TextField>
                        )} />
                      </Box>
                      <Controller name="dob" control={pc} render={({ field }) => (
                        <DatePicker
                          label="Date of Birth"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(val) => field.onChange(val ? val.format("YYYY-MM-DD") : "")}
                          disableFuture
                          slotProps={{ textField: { error: !!pe.dob, helperText: pe.dob?.message, sx: { ...fieldSx, width: "100%" } } }}
                        />
                      )} />
                      <Controller name="avatar_url" control={pc} render={({ field }) => (
                        <TextField {...field} label="Avatar URL (optional)" placeholder="https://..." error={!!pe.avatar_url} helperText={pe.avatar_url?.message} sx={fieldSx} />
                      )} />
                      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                        <Button type="submit" variant="contained" disabled={profileMutation.isPending} startIcon={<Check size={15} />} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", px: 3.5, py: 1.2 }}>
                          {profileMutation.isPending ? "Saving…" : "Save Changes"}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* ── Preferences ───────────────────────── */}
                {activeTab === "Preferences" && (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontFamily: '"DM Serif Display", serif', fontSize: "1.25rem", color: theme.palette.text.primary, mb: 0.4 }}>
                        Travel Preferences
                      </Typography>
                      <Typography sx={{ fontSize: "0.83rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        Customise your default currency, home country, and travel style.
                      </Typography>
                    </Box>
                    <Box component="form" onSubmit={hspref((d) => { setPrefMsg(null); prefMutation.mutate(d); })} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      {prefMsg && (
                        <Alert severity={prefMsg.type} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.825rem", borderRadius: "10px" }}>{prefMsg.text}</Alert>
                      )}
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <Controller name="preferred_currency" control={prefc} render={({ field }) => (
                          <TextField {...field} select label="Preferred Currency" sx={fieldSx}>
                            {CURRENCIES.map((c) => <MenuItem key={c} value={c} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>{c}</MenuItem>)}
                          </TextField>
                        )} />
                        <Controller name="home_country" control={prefc} render={({ field }) => (
                          <TextField {...field} label="Home Country" placeholder="e.g. India" error={!!prefe.home_country} helperText={prefe.home_country?.message} sx={fieldSx} />
                        )} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.5, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                          Travel Styles
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {TRAVEL_STYLES.map((style) => {
                            const selected = travelStyles.includes(style);
                            return (
                              <Chip
                                key={style}
                                label={style}
                                onClick={() => setTravelStyles((prev) => selected ? prev.filter((s) => s !== style) : [...prev, style])}
                                sx={{
                                  fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.8rem",
                                  fontWeight: selected ? 600 : 400,
                                  backgroundColor: selected ? (isDark ? "rgba(245,158,11,0.15)" : "rgba(122,78,0,0.1)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
                                  color: selected ? pri : sub,
                                  border: `1px solid ${selected ? pri + "40" : border}`,
                                  cursor: "pointer",
                                  "&:hover": { backgroundColor: selected ? undefined : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)") },
                                }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                        <Button type="submit" variant="contained" disabled={prefMutation.isPending} startIcon={<Check size={15} />} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", px: 3.5, py: 1.2 }}>
                          {prefMutation.isPending ? "Saving…" : "Save Preferences"}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* ── Security ──────────────────────────── */}
                {activeTab === "Security" && (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontFamily: '"DM Serif Display", serif', fontSize: "1.25rem", color: theme.palette.text.primary, mb: 0.4 }}>
                        Password & Security
                      </Typography>
                      <Typography sx={{ fontSize: "0.83rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                        Change your account password. Use a strong, unique passphrase.
                      </Typography>
                    </Box>
                    <Box component="form" onSubmit={hspw((d) => { setPwMsg(null); pwMutation.mutate(d); })} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      {pwMsg && (
                        <Alert severity={pwMsg.type} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.825rem", borderRadius: "10px" }}>{pwMsg.text}</Alert>
                      )}
                      <Controller name="current_password" control={pwc} render={({ field }) => (
                        <TextField {...field} type="password" label="Current Password" error={!!pwe.current_password} helperText={pwe.current_password?.message} sx={fieldSx} />
                      )} />
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <Controller name="new_password" control={pwc} render={({ field }) => (
                          <TextField {...field} type="password" label="New Password" error={!!pwe.new_password} helperText={pwe.new_password?.message} sx={fieldSx} />
                        )} />
                        <Controller name="confirm_password" control={pwc} render={({ field }) => (
                          <TextField {...field} type="password" label="Confirm New Password" error={!!pwe.confirm_password} helperText={pwe.confirm_password?.message} sx={fieldSx} />
                        )} />
                      </Box>
                      <Box sx={{ p: 2.5, borderRadius: "12px", backgroundColor: isDark ? "rgba(245,158,11,0.04)" : "rgba(122,78,0,0.03)", border: `1px solid ${isDark ? "rgba(245,158,11,0.12)" : "rgba(122,78,0,0.1)"}` }}>
                        <Typography sx={{ fontSize: "0.78rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.6 }}>
                          Use at least 8 characters. Mix uppercase letters, numbers, and symbols for a stronger password.
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                        <Button type="submit" variant="contained" disabled={pwMutation.isPending} startIcon={<Lock size={15} />} sx={{ fontFamily: "Plus Jakarta Sans, sans-serif", px: 3.5, py: 1.2 }}>
                          {pwMutation.isPending ? "Updating…" : "Change Password"}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          </Box>
          </motion.div>

          {/* ── RIGHT: identity card + contextual live preview ── */}
          <motion.div variants={fadeUp} style={{ position: "sticky", top: 24 }}>

            {/* Identity card — always visible */}
            <Box sx={{
              p: 3, borderRadius: "18px", mb: 2, textAlign: "center",
              backgroundColor: paper, border: `1px solid ${border}`,
              backgroundImage: isDark
                ? "linear-gradient(150deg, rgba(245,158,11,0.07) 0%, transparent 55%)"
                : "linear-gradient(150deg, rgba(245,158,11,0.05) 0%, transparent 55%)",
            }}>
              <Avatar
                src={user?.avatar_url ?? undefined}
                sx={{
                  width: 84, height: 84, fontSize: "1.7rem", fontWeight: 700, mx: "auto", mb: 2,
                  backgroundColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(122,78,0,0.12)",
                  color: pri,
                  border: `3px solid ${isDark ? "rgba(245,158,11,0.28)" : "rgba(122,78,0,0.18)"}`,
                  boxShadow: isDark ? "0 0 0 5px rgba(245,158,11,0.07)" : "0 0 0 5px rgba(122,78,0,0.05)",
                }}
              >
                {initials}
              </Avatar>
              <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: theme.palette.text.primary, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.25 }}>
                {user?.name ?? "—"}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.4 }}>
                {user?.email}
              </Typography>
              <Box sx={{ display: "inline-flex", mt: 1.5, px: 1.75, py: 0.4, borderRadius: "20px", backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.07)", border: `1px solid ${isDark ? "rgba(245,158,11,0.22)" : "rgba(122,78,0,0.16)"}` }}>
                <Typography sx={{ fontSize: "0.62rem", color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" }}>
                  Traveller
                </Typography>
              </Box>

              {/* Stats strip */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", mt: 2.5, pt: 2.5, borderTop: `1px solid ${border}` }}>
                {[
                  { label: "Trips",     value: totalTrips,  Icon: Globe    },
                  { label: "Countries", value: countries,   Icon: MapPin   },
                  { label: "Since",     value: memberSince, Icon: Calendar },
                ].map(({ label, value, Icon }) => (
                  <Box key={label} sx={{ textAlign: "center", px: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5, color: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.2)" }}><Icon size={12} /></Box>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: isDark ? "#E8D5B4" : "#1C1206", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.1 }}>
                      {value}
                    </Typography>
                    <Typography sx={{ fontSize: "0.63rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", mt: 0.2 }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Contextual section — mirrors the active tab */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "Personal Info" && (
                  <SideSection title="Saved Personal Info" Icon={User} border={border} paper={paper}>
                    <InfoRow label="Full Name"     value={user?.name} />
                    <InfoRow label="Date of Birth" value={dobDisplay} />
                    <InfoRow label="Gender"        value={user?.gender} />
                    <InfoRow label="Avatar"        value={user?.avatar_url ? "Custom URL" : "Default"} muted />
                  </SideSection>
                )}

                {activeTab === "Preferences" && (
                  <SideSection title="Saved Preferences" Icon={Compass} border={border} paper={paper}>
                    <InfoRow label="Currency"     value={user?.preferences?.preferred_currency} />
                    <InfoRow label="Home Country" value={user?.preferences?.home_country} />
                    {(user?.preferences?.travel_styles?.length ?? 0) > 0 ? (
                      <Box sx={{ pt: 1.25 }}>
                        <Typography sx={{ fontSize: "0.67rem", color: theme.palette.text.disabled, fontFamily: "Plus Jakarta Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
                          Travel Styles
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                          {(user?.preferences?.travel_styles ?? []).map((s) => (
                            <Box key={s} sx={{ px: 1, py: 0.3, borderRadius: "6px", backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.07)", border: `1px solid ${isDark ? "rgba(245,158,11,0.2)" : "rgba(122,78,0,0.14)"}` }}>
                              <Typography sx={{ fontSize: "0.7rem", color: pri, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600 }}>{s}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <InfoRow label="Travel Styles" value={undefined} />
                    )}
                  </SideSection>
                )}

                {activeTab === "Security" && (
                  <SideSection title="Account Info" Icon={Shield} border={border} paper={paper}>
                    <InfoRow label="Email"        value={user?.email} />
                    <InfoRow label="Member Since" value={memberSince} />
                    <InfoRow label="Auth Method"  value="Email / Password" muted />
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: "10px", backgroundColor: isDark ? "rgba(245,158,11,0.04)" : "rgba(122,78,0,0.03)", border: `1px solid ${isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.08)"}` }}>
                      <Typography sx={{ fontSize: "0.73rem", color: sub, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.55 }}>
                        Use a strong password you don't use elsewhere. Consider a passphrase of 4+ random words.
                      </Typography>
                    </Box>
                  </SideSection>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
}
