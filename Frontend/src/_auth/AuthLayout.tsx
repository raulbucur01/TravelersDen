import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { pageTransitionAnimation } from "@/utilities/utils";

const AuthLayout = () => {
  return (
    <motion.div
      {...pageTransitionAnimation}
      className="relative h-screen w-screen"
    >
      <img
        src="/assets/images/beach_wallpaper_auth.jpg"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover bg-no-repeat"
      />

      <section className="absolute inset-0 flex justify-center items-center z-10">
        <div className="sm:w-420 flex-center flex-col bg-black bg-opacity-75 text-white p-6 rounded-lg shadow-lg">
          <Outlet />
        </div>
      </section>
    </motion.div>
  );
};

export default AuthLayout;
