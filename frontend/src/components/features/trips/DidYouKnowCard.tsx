import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { GENERAL_FACTS, COUNTRY_FACTS } from "../../../data/travelFacts";
import { fadeUp } from "../../../theme/motion";

interface Props {
  country: string;
  isDark: boolean;
  border: string;
  paper: string;
}

export function DidYouKnowCard({ country, isDark, border, paper }: Props) {
  const facts = useMemo(() => {
    const normalised = country.trim();
    const pool = (normalised && COUNTRY_FACTS[normalised]?.length)
      ? [...COUNTRY_FACTS[normalised]]
      : [...GENERAL_FACTS];

    const result: string[] = [];
    for (let i = 0; i < Math.min(2, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      result.push(pool.splice(idx, 1)[0]);
    }
    return result;
  }, [country]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div variants={fadeUp}>
      <Box
        sx={{
          p: 2.75, borderRadius: "16px",
          backgroundColor: paper,
          border: `1px solid ${border}`,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: "8px",
              backgroundColor: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: "0.75rem", lineHeight: 1 }}>✦</Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: "0.62rem", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#F59E0B", fontFamily: "Plus Jakarta Sans, sans-serif",
                lineHeight: 1.1,
              }}
            >
              Did You Know?
            </Typography>
            {country && (
              <Typography
                sx={{
                  fontSize: "0.6rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
                  fontFamily: "Plus Jakarta Sans, sans-serif", lineHeight: 1.2, mt: 0.15,
                }}
              >
                {country}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Facts */}
        <AnimatePresence mode="wait">
          <motion.div
            key={country}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {facts.map((fact, i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 5, height: 5, borderRadius: "50%",
                      backgroundColor: "rgba(245,158,11,0.6)",
                      mt: "7px", flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.8rem", lineHeight: 1.65,
                      color: isDark ? "rgba(237,232,223,0.78)" : "rgba(28,18,6,0.75)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {fact}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}
