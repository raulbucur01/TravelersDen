import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { motion } from "framer-motion";
import Topbar from "@/components/shared/Topbar";
import { Outlet } from "react-router-dom";
import { pageTransitionAnimation } from "@/lib/utils";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <Topbar />

      <LeftSidebar />

      <motion.section
        {...pageTransitionAnimation}
        className="flex flex-1 h-full"
      >
        <Outlet />
      </motion.section>
      <Bottombar />
    </div>
  );
};

export default RootLayout;
