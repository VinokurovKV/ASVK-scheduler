import { Box, CircularProgress } from "@mui/material";

import { useQuery } from "@tanstack/react-query";

import { Navigate, Outlet } from "react-router-dom";

import { getCurrentUser } from "../../api/auth";
import { AUTH_QUERY_KEY } from "../../api/authQuery";

export const ProtectedRoute = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "grid",
          minHeight: "100dvh",
          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
