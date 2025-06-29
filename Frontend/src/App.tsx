import AuthLayout from "./_auth/AuthLayout";
import SigninForm from "./_auth/forms/SigninForm";
import SignupForm from "./_auth/forms/SignupForm";
import {
  Home,
  Explore,
  Saved,
  AllUsers,
  CreatePost,
  Profile,
  MapPage,
  UpdatePost,
  PostDetails,
  ItineraryGeneratorDashboard,
} from "./_root/pages";
import RootLayout from "./_root/RootLayout";
import "./globals.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ItineraryEditor from "./_root/pages/ItineraryEditor";
import PublicRoute from "./utilities/routing/PublicRoute";
import ProtectedRoute from "./utilities/routing/ProtectedRoute";
import { useUserContext } from "./context/AuthContext";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import RecommendationPreview from "./_root/pages/RecommendationPreview";

const App = () => {
  const location = useLocation();
  const { isLoading, checkAuthUser } = useUserContext();

  useEffect(() => {
    checkAuthUser(); // global auth check, this avoids checking again each time we visit a route
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <main className="flex h-screen">
      <AnimatePresence mode="wait">
        <Routes key={location.pathname} location={location}>
          <Route
            element={
              <PublicRoute>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route path="/sign-in" element={<SigninForm />} />
            <Route path="/sign-up" element={<SignupForm />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <RootLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/recomm-prev" element={<RecommendationPreview />} />
            <Route index element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post-details/:id" element={<PostDetails />} />
            <Route path="/profile/:id/*" element={<Profile />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/update-post/:id" element={<UpdatePost />} />
            <Route
              path="/itinerary-generator-dashboard"
              element={<ItineraryGeneratorDashboard />}
            />
            <Route path="itinerary-editor/:id?" element={<ItineraryEditor />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster />
    </main>
  );
};

export default App;
