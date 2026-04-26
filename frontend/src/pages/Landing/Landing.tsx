import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Button, Container, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { ROUTES } from "../../constants/routes";
import { usePexelsPhoto } from "../../hooks/usePexelsPhoto";

// ── Inline SVG icons ─────────────────────────────────────────
const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);
const CalendarCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <polyline points="9,16 11,18 15,14"/>
  </svg>
);
const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const ArrowDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Data ──────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon:    SparkleIcon,
    title:   "AI Itinerary Builder",
    desc:    "Describe your dream trip and our LangGraph AI agent crafts a complete, personalised day-by-day plan — restaurants, landmarks, hidden gems, travel times, and more.",
    bullets: ["Day-by-day activity planning", "Local food and culture tips", "Optimised daily routes"],
  },
  {
    Icon:    CalendarCheckIcon,
    title:   "Smart Booking Tracker",
    desc:    "Keep every flight, hotel, and activity in one place. Track statuses, upload confirmations, and share your complete itinerary with travel companions instantly.",
    bullets: ["Flight & hotel tracking", "Status alerts & reminders", "Easy sharing with co-travellers"],
  },
  {
    Icon:    GlobeIcon,
    title:   "Live Travel Intelligence",
    desc:    "Real-time weather forecasts, live currency exchange rates, and destination insights — everything you need to plan confidently and adapt on the go.",
    bullets: ["7-day weather forecasts", "Live currency conversion", "Destination safety & tips"],
  },
];

const STEPS = [
  { n: "01", title: "Tell us your destination",   desc: "Share where, when, your travel style, budget, and companions. The more detail, the better the plan." },
  { n: "02", title: "AI crafts your itinerary",   desc: "Our AI agent researches your destination, structures your days, and fills in the details — in seconds." },
  { n: "03", title: "Book, track, and explore",   desc: "Manage every booking, check live weather, convert currencies, and update your trip from one dashboard." },
];

const STATS = [
  { value: "10k+",  label: "Trips planned"     },
  { value: "50+",   label: "Countries covered"  },
  { value: "4.9★",  label: "Average rating"     },
  { value: "< 30s", label: "Itinerary in"       },
];

// ── Helpers ───────────────────────────────────────────────────
const reveal = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true, margin: "-60px" } as const,
  transition: { duration: 0.65, ease: "easeOut" as const, delay },
});

// ── Component ─────────────────────────────────────────────────
export default function Landing() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const bg     = theme.palette.background.default;
  const paper  = theme.palette.background.paper;
  const pri    = theme.palette.primary.main;
  const txt    = theme.palette.text.primary;
  const sub    = theme.palette.text.secondary;

  const { data: heroPhoto } = usePexelsPhoto("aerial travel landscape mountains adventure");
  const { data: ctaPhoto  } = usePexelsPhoto("travel road journey freedom wanderlust");

  // Section alternating background
  const altBg  = isDark ? "#0F0D09" : "#F5EFE4";
  const border  = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";

  return (
    <Box sx={{ backgroundColor: bg, color: txt }}>

      {/* ═══════════════════════ NAVBAR ════════════════════════ */}
      <Box
        component="nav"
        sx={{
          position:        "fixed",
          top: 0, left: 0, right: 0,
          zIndex:          100,
          px:              { xs: 3, md: 6 },
          py:              1.75,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "space-between",
          backdropFilter:  "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor: isDark ? "rgba(13,11,8,0.82)" : "rgba(253,250,245,0.88)",
          borderBottom:    `1px solid ${border}`,
        }}
      >
        {/* Logo */}
        <Box component={RouterLink} to={ROUTES.home} sx={{ display: "flex", alignItems: "center", gap: 1.25, textDecoration: "none" }}>
          <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 32, width: "auto" }} />
          <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: pri, fontSize: "1.25rem", lineHeight: 1, letterSpacing: "-0.01em" }}>
            RouteGenie
          </Typography>
        </Box>

        {/* Nav links — hide on mobile */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 3.5 }}>
          {(["Features", "How it works"] as const).map((label) => (
            <Typography
              key={label}
              component="a"
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              sx={{ color: sub, fontSize: "0.875rem", textDecoration: "none", "&:hover": { color: pri }, transition: "color 0.2s", cursor: "pointer" }}
            >
              {label}
            </Typography>
          ))}
          <Typography
            component={RouterLink}
            to={ROUTES.about}
            sx={{ color: sub, fontSize: "0.875rem", textDecoration: "none", "&:hover": { color: pri }, transition: "color 0.2s" }}
          >
            About
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ThemeToggle />
          <Button component={RouterLink} to={ROUTES.login} variant="outlined" color="primary" size="small" sx={{ display: { xs: "none", sm: "inline-flex" }, px: 2, py: 0.75, fontSize: "0.8rem" }}>
            Sign in
          </Button>
          <Button component={RouterLink} to={ROUTES.signup} variant="contained" color="primary" size="small" sx={{ px: 2, py: 0.75, fontSize: "0.8rem" }}>
            Start free
          </Button>
        </Box>
      </Box>

      {/* ═══════════════════════ HERO ══════════════════════════ */}
      <Box
        sx={{
          position:   "relative",
          minHeight:  "100vh",
          display:    "flex",
          alignItems: "center",
          overflow:   "hidden",
        }}
      >
        {/* Background image */}
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "linear" }}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
        >
          <Box component="img" src={heroPhoto?.url ?? ""} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </motion.div>

        {/* Overlays — base dark wash first, then directional gradients */}
        <Box sx={{ position: "absolute", inset: 0, backgroundColor: "rgba(13,11,8,0.62)", zIndex: 1 }} />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,11,8,0.45) 0%, rgba(13,11,8,0.05) 35%, rgba(13,11,8,0.05) 60%, rgba(13,11,8,0.75) 100%)", zIndex: 1 }} />
        <Box sx={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(13,11,8,0.35) 100%)`, zIndex: 1 }} />

        {/* Content */}
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2, textAlign: "center", pt: 12, pb: 10 }}>
          <motion.div {...reveal()}>
            {/* Badge */}
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 1,
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "100px",
              px: 2, py: 0.75, mb: 3,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#F59E0B", boxShadow: "0 0 8px #F59E0B", flexShrink: 0 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.75rem", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 500, letterSpacing: "0.04em" }}>
                AI-Powered Trip Planning
              </Typography>
            </Box>
          </motion.div>

          <motion.div {...reveal(0.1)}>
            <Typography
              sx={{
                fontFamily:    '"DM Serif Display", serif',
                color:         "#FDF6EC",
                fontSize:      { xs: "2.6rem", sm: "3.6rem", md: "4.4rem" },
                lineHeight:    1.1,
                letterSpacing: "-0.02em",
                mb:            2.5,
              }}
            >
              Your AI companion for{" "}
              <Box component="span" sx={{ color: "#F59E0B", fontStyle: "italic" }}>every adventure</Box>
            </Typography>
          </motion.div>

          <motion.div {...reveal(0.2)}>
            <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: "1rem", md: "1.15rem" }, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.7, maxWidth: 540, mx: "auto", mb: 4.5 }}>
              Tell us where you want to go. Our AI builds a complete, personalised itinerary in seconds — and keeps everything organised from first idea to last memory.
            </Typography>
          </motion.div>

          <motion.div {...reveal(0.3)}>
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              <Button component={RouterLink} to={ROUTES.signup} variant="contained" color="primary" size="large"
                sx={{ px: 4, py: 1.4, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Start planning free
              </Button>
              <Button
                component="a" href="#how-it-works" variant="outlined"
                sx={{ px: 3.5, py: 1.4, fontSize: "0.95rem", borderColor: "rgba(255,255,255,0.55)", color: "rgba(255,255,255,0.92)", fontFamily: "Plus Jakarta Sans, sans-serif",
                  "&:hover": { borderColor: "rgba(255,255,255,0.9)", backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" } }}
              >
                See how it works
              </Button>
            </Box>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            style={{ marginTop: 72, display: "flex", justifyContent: "center" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{ opacity: { delay: 1.2, duration: 0.6 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
          >
            <Box sx={{ color: "rgba(196,168,130,0.5)" }}><ArrowDownIcon /></Box>
          </motion.div>
        </Container>
      </Box>

      {/* ═══════════════════════ STATS BAR ═════════════════════ */}
      <Box sx={{ backgroundColor: isDark ? "#0A0804" : "#1C1206", py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: { xs: 4, md: 0 } }}>
            {STATS.map((s, i) => (
              <Box
                key={s.label}
                sx={{
                  flex:       "1 1 120px",
                  textAlign:  "center",
                  position:   "relative",
                  "&::after": i < STATS.length - 1 ? {
                    content:    '""',
                    position:   "absolute",
                    right:      0, top: "20%",
                    height:     "60%",
                    width:      "1px",
                    backgroundColor: "rgba(245,158,11,0.15)",
                  } : {},
                }}
              >
                <Typography sx={{ color: "#F59E0B", fontSize: "1.75rem", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ color: "rgba(196,168,130,0.6)", fontSize: "0.75rem", letterSpacing: "0.06em", mt: 0.5 }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ═══════════════════════ FEATURES ══════════════════════ */}
      <Box id="features" sx={{ backgroundColor: bg, py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <motion.div {...reveal()}>
            <Typography sx={{ textAlign: "center", color: pri, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.5 }}>
              What RouteGenie does
            </Typography>
            <Typography sx={{ textAlign: "center", fontFamily: '"DM Serif Display", serif', color: txt, fontSize: { xs: "2rem", md: "2.8rem" }, letterSpacing: "-0.02em", mb: 1.5 }}>
              Everything you need to travel smarter
            </Typography>
            <Typography sx={{ textAlign: "center", color: sub, fontSize: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", maxWidth: 480, mx: "auto", mb: 8, lineHeight: 1.7 }}>
              From first idea to final memory — RouteGenie handles the planning so you can focus on the experience.
            </Typography>
          </motion.div>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...reveal(i * 0.12)}>
                <Box
                  sx={{
                    height:          "100%",
                    p:               4,
                    borderRadius:    "16px",
                    backgroundColor: paper,
                    border:          `1px solid ${border}`,
                    transition:      "all 0.3s ease",
                    "&:hover": {
                      borderColor: `${pri}40`,
                      boxShadow:   isDark ? `0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px ${pri}22` : `0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px ${pri}22`,
                      transform:   "translateY(-4px)",
                    },
                  }}
                >
                  <Box sx={{ display: "inline-flex", p: 1.5, borderRadius: "10px", backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(122,78,0,0.08)", color: pri, mb: 3 }}>
                    <f.Icon />
                  </Box>
                  <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: txt, fontSize: "1.3rem", mb: 1.25 }}>
                    {f.title}
                  </Typography>
                  <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.7, mb: 2.5 }}>
                    {f.desc}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {f.bullets.map((b) => (
                      <Box key={b} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ color: pri, display: "flex", flexShrink: 0 }}><CheckIcon /></Box>
                        <Typography sx={{ color: sub, fontSize: "0.8rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{b}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ═════════════════════ HOW IT WORKS ════════════════════ */}
      <Box id="how-it-works" sx={{ backgroundColor: altBg, py: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <motion.div {...reveal()}>
            <Typography sx={{ textAlign: "center", color: pri, fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans, sans-serif", mb: 1.5 }}>
              Simple by design
            </Typography>
            <Typography sx={{ textAlign: "center", fontFamily: '"DM Serif Display", serif', color: txt, fontSize: { xs: "2rem", md: "2.8rem" }, letterSpacing: "-0.02em", mb: 8 }}>
              From idea to itinerary in three steps
            </Typography>
          </motion.div>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: { xs: 5, md: 4 }, position: "relative" }}>
            {/* Connecting line — desktop only */}
            <Box sx={{ display: { xs: "none", md: "block" }, position: "absolute", top: 28, left: "16.5%", right: "16.5%", height: "1px", backgroundColor: border, zIndex: 0 }} />

            {STEPS.map((step, i) => (
              <motion.div key={step.n} {...reveal(i * 0.15)}>
                <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                  {/* Step number circle */}
                  <Box sx={{
                    width:           56,
                    height:          56,
                    borderRadius:    "50%",
                    border:          `1.5px solid ${isDark ? "rgba(245,158,11,0.35)" : "rgba(122,78,0,0.3)"}`,
                    backgroundColor: isDark ? "rgba(245,158,11,0.08)" : "rgba(122,78,0,0.06)",
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                    mx:              "auto",
                    mb:              3,
                  }}>
                    <Typography sx={{ color: pri, fontFamily: "JetBrains Mono, monospace", fontSize: "0.9rem", fontWeight: 600 }}>
                      {step.n}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: txt, fontSize: "1.25rem", mb: 1.25 }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: sub, fontSize: "0.875rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.7, maxWidth: 260, mx: "auto" }}>
                    {step.desc}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ═══════════════════════ CTA BANNER ════════════════════ */}
      <Box
        sx={{
          position:   "relative",
          py:         { xs: 12, md: 18 },
          overflow:   "hidden",
          textAlign:  "center",
        }}
      >
        <Box component="img" src={ctaPhoto?.url ?? ""} alt="" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <Box sx={{ position: "absolute", inset: 0, background: "rgba(13,11,8,0.82)" }} />
        <Box sx={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.18)"} 0%, transparent 65%)` }} />

        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div {...reveal()}>
            <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 52, width: "auto", mb: 2.5 }} />
            <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "#FDF6EC", fontSize: { xs: "2rem", md: "2.8rem" }, letterSpacing: "-0.02em", mb: 1.5, lineHeight: 1.2 }}>
              Ready to plan your next adventure?
            </Typography>
            <Typography sx={{ color: "rgba(196,168,130,0.85)", fontSize: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.7, mb: 4 }}>
              Join thousands of travellers who plan smarter with RouteGenie. Free to start, no credit card required.
            </Typography>
            <Button component={RouterLink} to={ROUTES.signup} variant="contained" color="primary" size="large"
              sx={{ px: 5, py: 1.5, fontSize: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Start planning free
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* ═══════════════════════ FOOTER ════════════════════════ */}
      <Box sx={{ backgroundColor: isDark ? "#0A0804" : "#1C1206", py: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 3 }}>
            {/* Logo + tagline */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box component="img" src="/Icon.png" alt="RouteGenie" sx={{ height: 28, width: "auto" }} />
              <Typography sx={{ fontFamily: '"DM Serif Display", serif', color: "#F59E0B", fontSize: "1.1rem" }}>
                RouteGenie
              </Typography>
            </Box>

            {/* Links */}
            <Box sx={{ display: "flex", gap: 3 }}>
              {[
                { label: "Features",    href: "#features"      },
                { label: "How it works",href: "#how-it-works"  },
                { label: "Sign up",     href: ROUTES.signup    },
              ].map((l) => (
                <Typography key={l.label} component="a" href={l.href}
                  sx={{ color: "rgba(196,168,130,0.55)", fontSize: "0.8rem", textDecoration: "none", "&:hover": { color: "#F59E0B" }, transition: "color 0.2s" }}>
                  {l.label}
                </Typography>
              ))}
            </Box>

            {/* Copyright */}
            <Typography sx={{ color: "rgba(196,168,130,0.35)", fontSize: "0.75rem" }}>
              © {new Date().getFullYear()} RouteGenie. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
