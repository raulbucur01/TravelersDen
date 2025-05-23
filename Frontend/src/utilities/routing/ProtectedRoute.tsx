import { Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useUserContext();

  return isAuthenticated ? children : <Navigate to="/sign-in" replace />;
};

export default ProtectedRoute;
