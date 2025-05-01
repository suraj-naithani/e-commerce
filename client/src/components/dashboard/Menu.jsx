import { FaRegUser } from "react-icons/fa";
import { IoCartOutline, IoSettingsOutline } from "react-icons/io5";
import { LuLayoutDashboard, LuShoppingBag } from "react-icons/lu";
import { MdOutlineReviews } from "react-icons/md";
import { PiSignOut } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import { TfiStatsUp } from "react-icons/tfi";

import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useUserLogoutMutation } from "../../redux/api/authApi";
import { userNotExist } from "../../redux/reducer/authReducer";

const Menu = () => {
  const { user } = useSelector((state) => state.authReducer);
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutUser] = useUserLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(userNotExist());
      toast.success("Successfully logged out");
      navigate("/signin");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const menuLinks =
    user?.role === "Admin"
      ? [
          {
            to: "/dashboard/home",
            icon: <LuLayoutDashboard />,
            label: "Dashboard",
          },
          {
            to: "/dashboard/products",
            icon: <LuShoppingBag />,
            label: "Products",
          },
          {
            to: "/dashboard/allOrder",
            icon: <IoCartOutline />,
            label: "All Order",
          },
          // {
          //   to: "/dashboard/stats",
          //   icon: <TfiStatsUp />,
          //   label: "Stats",
          // },
          {
            to: "/dashboard/profile",
            icon: <FaRegUser />,
            label: "Profile",
          },
          {
            to: "/dashboard/setting",
            icon: <IoSettingsOutline />,
            label: "Settings",
          },
        ]
      : [
          {
            to: "/dashboard/home",
            icon: <LuLayoutDashboard />,
            label: "Dashboard",
          },
          {
            to: "/dashboard/products",
            icon: <LuShoppingBag />,
            label: "Products",
          },
          {
            to: "/dashboard/allOrder",
            icon: <IoCartOutline />,
            label: "All Order",
          },
          // {
          //   to: "/dashboard/stats",
          //   icon: <TfiStatsUp />,
          //   label: "Stats",
          // },
          {
            to: "/dashboard/reviews",
            icon: <MdOutlineReviews />,
            label: "Review",
          },
          {
            to: "/dashboard/profile",
            icon: <FaRegUser />,
            label: "Profile",
          },
          {
            to: "/dashboard/setting",
            icon: <IoSettingsOutline />,
            label: "Settings",
          },
        ];

  return (
    <div className="flex flex-col justify-between h-full w-full pt-7">
      {/* Profile Section */}
      <div className="flex flex-col gap-7">
        <div className="flex flex-col items-center gap-4">
          <img
            src={user?.avatar || "/avatar.png"}
            alt="Profile"
            className="w-12 h-12 rounded-full"
          />
          <div className="text-center">
            <p className="text-[#343a40]">{user?.name || "Guest"}</p>
            <p className="text-sm text-[#8590a5]">{user?.role || "User"}</p>
          </div>
        </div>

        {/* Menu Links */}
        <div className="flex flex-col gap-5 w-full items-center md:items-start">
          {menuLinks.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2 text-[#8590a5] hover:text-[#3592ff] rounded-md ${
                  isActive || location.pathname === "/dashboard"
                    ? "text-[#3592ff] bg-[#f0f4ff]"
                    : ""
                } md:w-full`
              }
              aria-label={label}
            >
              {icon}
              <p className="hidden md:block whitespace-nowrap">{label}</p>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center justify-center md:justify-start gap-3 px-5 py-2 text-[#8590a5] hover:text-[#3592ff] rounded-md ${
            isActive || location.pathname === "/dashboard"
              ? "text-[#3592ff] bg-[#f0f4ff]"
              : ""
          } md:w-full`
        }
      >
        <PiSignOut className="text-center" />
        <Link
          to="/signin"
          className="hidden md:block whitespace-nowrap"
          onClick={handleLogout}
        >
          Sign Out
        </Link>
      </NavLink>
    </div>
  );
};

export default Menu;
