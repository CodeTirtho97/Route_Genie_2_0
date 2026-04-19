import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Container, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { ROUTES } from "../../constants/routes";

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const TECH_STACK = [
  {
    category: "Frontend",
    color:    "#60A5FA",
    items:    ["React 19", "TypeScript", "MUI v6", "Framer Motion", "TanStack Query", "Zustand", "Zod"],
  },
  {
    category: "Backend",
    color:    "#4ADE80",
    items:    ["FastAPI", "Python 3.12", "Beanie ODM", "Motor", "Redis (Upstash)", "JWT Auth"],
  },
  {
    category: "AI & Data",
    color:    "#F59E0B",
    items:    ["LangGraph", "Groq API", "Llama 3.3 70B", "OpenWeatherMap", "Exchange Rate API", "Unsplash"],
  },
  {
    category: "Infrastructure",
    color:    "#C084FC",
    items:    ["MongoDB Atlas", "Upstash Redis", "Vercel (Frontend)", "Railway (Backend)", "GitHub Actions"],
  },
];

const VALUES = [
  {
    title: "AI that actually helps",
    desc:  "RouteGenie doesn't just surface search results — it reasons about your preferences, budget, and travel style to build a plan that fits you, not a template.",
  },
  {
    title: "Built for the whole journey",
    desc:  "From the first idea to the final day, RouteGenie tracks your bookings, shows live conditions, and keeps your trip organised in one place.",
  },
  {
    title: "Open and honest",
    desc:  "We show you what our AI is thinking. No black-box suggestions — every recommendation comes with context you can understand and override.",
  },
];

const reveal = (delay = 0) => ({
  initial:     { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0  },
  viewport:    { once: true, margin: "-40px" } as const,
  transition:  { duration: 0.6, ease: "easeOut" as const, delay },
});

export default function About() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const bg     = theme.palette.background.default;
  const paper  = theme.palette.background.paper;
  const pri    = theme.palette.primary.main;
  const txt    = theme.palette.text.primary;
  const sub    = theme.palette.text.secondary;
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const altBg  = isDark ? "#0F0D09" : "#F5EFE4";

  return (
    <Box sx={{ backgroundColor: bg, color: txt, minHeight: "100vh" }}>

      {/* ── Minimal nav ────────────────────────────────────── */}
      <Box sx={{
        position:        "sticky",
        top: 0, zIndex:  100,
        px:              { xs: 3, md: 6 },
        py:              1.75,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        backdropFilter:  "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: isDark ? "rgba(13,11,8,0.82)" : "rgba(253,250,245,0.88)",
        borderBottom:    `1px solid ${border}`,
      }}>
        <Box component={RouterLink} to={ROUTES.home} sx={{ display: "flex", alignItems: "center", gap: 1.25, textDecoration: "none" }}>
          <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 30, width: "auto" }} />
          <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: pri, fontSize: "1.2rem", lineHeight: 1 }}>
            RouteGenie
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ThemeToggle />
          <Button
            component={RouterLink} to={ROUTES.home}
            startIcon={<BackIcon />}
            sx={{ color: sub, fontSize: "0.8rem", textTransform: "none", "&:hover": { color: pri } }}
          >
            Back to home
          </Button>
        </Box>
      </Box>

      {/* ── Hero ───────────────────────────────────────────── */}
      <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 8, md: 12 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 80, width: "auto", mb: 3 }} />
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: txt, fontSize: { xs: "2.4rem", md: "3.2rem" }, letterSpacing: "-0.02em", lineHeight: 1.15, mb: 1.75 }}>
              Built for the curious traveller
            </Typography>
            <Typography sx={{ color: sub, fontSize: { xs: "1rem", md: "1.1rem" }, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.8, maxWidth: 520, mx: "auto", mb: 4 }}>
              RouteGenie is an AI-powered travel intelligence platform — combining a conversational AI agent, smart booking management, and live travel data into one cohesive experience.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              <Button component={RouterLink} to={ROUTES.signup} variant="contained" color="primary" sx={{ px: 3.5, py: 1.2 }}>
                Start planning free
              </Button>
              <Button component={RouterLink} to={ROUTES.login} variant="outlined" color="primary" sx={{ px: 3.5, py: 1.2 }}>
                Sign in
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Mission ────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: altBg, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 6, md: 10 }, alignItems: "center" }}>
            <motion.div {...reveal()}>
              <Typography sx={{ color: pri, fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.5 }}>
                Our mission
              </Typography>
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: txt, fontSize: { xs: "1.8rem", md: "2.4rem" }, letterSpacing: "-0.02em", lineHeight: 1.2, mb: 2 }}>
                Planning a trip should feel like part of the adventure
              </Typography>
              <Typography sx={{ color: sub, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.8 }}>
                Too often, travel planning is fragmented — tabs open across a dozen sites, itineraries built in spreadsheets, booking confirmations buried in email. RouteGenie exists to change that. We believe the journey begins the moment you start dreaming, and great tools should make that process as exciting as the destination itself.
              </Typography>
            </motion.div>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {VALUES.map((v, i) => (
                <motion.div key={v.title} {...reveal(i * 0.12)}>
                  <Box sx={{ p: 3, borderRadius: "12px", backgroundColor: paper, border: `1px solid ${border}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: pri, flexShrink: 0, boxShadow: `0 0 8px ${pri}80` }} />
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif", color: txt }}>
                        {v.title}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: sub, fontSize: "0.83rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.75 }}>
                      {v.desc}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Tech stack ─────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div {...reveal()}>
            <Typography sx={{ textAlign: "center", color: pri, fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.5 }}>
              What's under the hood
            </Typography>
            <Typography sx={{ textAlign: "center", fontFamily: '"DM Serif Display", serif', color: txt, fontSize: { xs: "1.8rem", md: "2.4rem" }, letterSpacing: "-0.02em", mb: 8 }}>
              A modern, full-stack architecture
            </Typography>
          </motion.div>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
            {TECH_STACK.map((stack, i) => (
              <motion.div key={stack.category} {...reveal(i * 0.1)}>
                <Box sx={{ p: 3, borderRadius: "14px", backgroundColor: paper, border: `1px solid ${border}`, height: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: stack.color, boxShadow: `0 0 10px ${stack.color}80`, flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", fontFamily: "Plus Jakarta Sans, sans-serif", color: stack.color, letterSpacing: "0.04em" }}>
                      {stack.category}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {stack.items.map((item) => (
                      <Typography key={item} sx={{ color: sub, fontSize: "0.8rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.4 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── Footer ─────────────────────────────────────────── */}
      <Box sx={{ backgroundColor: isDark ? "#0A0804" : "#1C1206", py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 26, width: "auto" }} />
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "#F59E0B", fontSize: "1rem" }}>RouteGenie</Typography>
            </Box>
            <Typography sx={{ color: "rgba(196,168,130,0.35)", fontSize: "0.75rem" }}>
              © {new Date().getFullYear()} RouteGenie. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
