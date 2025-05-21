import { useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading, checkAuthUser } = useUserContext();

  useEffect(() => {
    checkAuthUser(); // checks cookie/session
  }, []);

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
