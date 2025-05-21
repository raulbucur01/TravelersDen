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

const App = () => {
  const location = useLocation();

  return (
    <main className="flex h-screen">
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

      <Toaster />
    </main>
  );
};

export default App;
