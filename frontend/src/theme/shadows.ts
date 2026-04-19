import { Shadows } from "@mui/material";

export const shadows: Shadows = [
  "none",
  "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",   // 1 — card resting
  "0 10px 40px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)", // 2 — card hover
  "0 0 40px rgba(245,158,11,0.25), 0 0 80px rgba(245,158,11,0.08)", // 3 — amber glow
  "0 0 30px rgba(232,93,38,0.2)",                             // 4 — accent glow
  "0 25px 60px rgba(0,0,0,0.7), 0 10px 24px rgba(0,0,0,0.5)", // 5 — modal
  "0 4px 20px rgba(245,158,11,0.3)",                          // 6 — button
  "0 6px 28px rgba(245,158,11,0.45)",                         // 7 — button hover
  ...Array(17).fill("none"),
] as Shadows;
