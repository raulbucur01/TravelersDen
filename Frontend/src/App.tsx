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
} from "./_root/pages";
import RootLayout from "./_root/RootLayout";
import "./globals.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  const location = useLocation();

  return (
    <main className="flex h-screen">
      <Routes key={location.pathname} location={location}>
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>

        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/update-post/:id" element={<UpdatePost />} />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;
