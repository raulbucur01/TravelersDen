import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;
  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="relative h-screen w-screen">
          <img
            src="/assets/images/beach_wallpaper_auth.jpg"
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover bg-no-repeat"
          />

          <section className="absolute inset-0 flex justify-center items-center z-10">
            <div className="sm:w-420 flex-center flex-col bg-black bg-opacity-70 text-white p-6 rounded-lg shadow-lg">
              <Outlet />
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default AuthLayout;
