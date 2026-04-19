import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { authService } from "../../services/auth.service";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { ROUTES } from "../../constants/routes";
import { pageTransition } from "../../theme/motion";

export default function Dashboard() {
  const theme     = useTheme();
  const { user, accessToken, logout } = useAuthStore();
  const navigate  = useNavigate();

  const handleLogout = async () => {
    if (accessToken) await authService.logout(accessToken).catch(() => {});
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit">
      <Box sx={{ minHeight: "100vh", p: 6, position: "relative" }}>

        {/* Theme toggle — top right */}
        <Box sx={{ position: "absolute", top: 24, right: 24 }}>
          <ThemeToggle />
        </Box>

        <Typography variant="h2" sx={{ mb: 1 }}>
          Welcome back, {user?.name?.split(" ")[0]}
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Dashboard coming in Phase 2.
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </motion.div>
  );
}
