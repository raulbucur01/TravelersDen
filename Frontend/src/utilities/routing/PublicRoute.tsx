import { useUserContext } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useUserContext();

  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

export default PublicRoute;
