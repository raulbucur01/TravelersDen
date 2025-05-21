import { Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading, checkAuthUser } = useUserContext();

  useEffect(() => {
    checkAuthUser(); // checks cookie/session
  }, []);

  if (isLoading) return null;

  return isAuthenticated ? children : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;
