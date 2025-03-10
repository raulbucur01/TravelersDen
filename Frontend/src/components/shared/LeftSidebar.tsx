import { useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/api/tanstack-query/queriesAndMutations";
import { INITIAL_USER, useUserContext } from "@/context/AuthContext";
import { sidebarLinks } from "@/constants";
import { INavLink } from "@/types";
import { ModeToggle } from "../ModeToggle";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated } = useUserContext();
  const {
    mutateAsync: signOut,
    isSuccess,
    isPending: isSigningOut,
  } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) {
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      navigate("/sign-in", { replace: true });
    }
  }, [isSuccess]);

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-8">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={20}
          />
        </Link>

        <Link
          to={`/profile/${user.userId}`}
          className="flex gap-3 items-center"
        >
          <img
            src={user.imageUrl || "assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="h-10 w-10 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-dm-light-3">@{user.username}</p>
          </div>
        </Link>

        <ModeToggle />

        <ul className="flex flex-col gap-4">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${
                  isActive &&
                  " hover:dark:bg-dm-secondary hover:bg-lm-primary hover:text-lm-light bg-lm-primary dark:bg-dm-secondary text-lm-light"
                }`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    // className={`group-hover:invert-white ${
                    //   isActive && "invert-white"
                    // }`}
                  ></img>
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant="ghost"
        className="shad-button_ghost mt-9"
        onClick={() => signOut()}
      >
        <img src="/assets/icons/logout.svg" alt="logout" />
        {isSigningOut ? (
          <p className="small-medium lg:base-medium">Signing out...</p>
        ) : (
          <p className="small-medium lg:base-medium">Sign out</p>
        )}
      </Button>
    </nav>
  );
};

export default LeftSidebar;
