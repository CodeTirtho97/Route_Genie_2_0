import { Box } from "@mui/material";
import { Compass } from "lucide-react";

interface Props {
  iconColor?: string;
}

export function TravelLoader({ iconColor = "rgba(255,255,255,0.45)" }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.25,
        "@keyframes rgSpin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "@keyframes rgBounce": {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: 0.35 },
          "40%": { transform: "translateY(-5px)", opacity: 1 },
        },
      }}
    >
      <Box sx={{ position: "relative", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "rgba(245,158,11,0.85)",
          borderRightColor: "rgba(245,158,11,0.3)",
          borderBottomColor: "rgba(245,158,11,0.08)",
          animation: "rgSpin 1.1s linear infinite",
        }} />
        <Compass size={14} style={{ color: iconColor }} />
      </Box>
      <Box sx={{ display: "flex", gap: 0.75 }}>
        {[0, 0.18, 0.36].map((delay, i) => (
          <Box key={i} sx={{
            width: 5, height: 5, borderRadius: "50%",
            backgroundColor: "rgba(245,158,11,0.55)",
            animation: `rgBounce 1.3s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </Box>
    </Box>
  );
}
