import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Menu from "../components/Dashboard/Menu";
import {
  useGetAdminDashboardDataQuery,
  useGetSellerDashboardDataQuery,
} from "../redux/api/dashboardApi";

const DashboardLayout = () => {
  const userRole = useSelector((state) => state.authReducer?.user?.role);

  const { data, isLoading, refetch } =
    userRole === "Admin"
      ? useGetAdminDashboardDataQuery()
      : useGetSellerDashboardDataQuery();

  return (
    <div className="max-h-[100vh] min-h-screen mx-auto overflow-hidden w-full flex bg-[#fbfdff] relative">
      <section className="flex-1 bg-white shadow-[2px_4px_9px_rgba(62,29,29,0.05)] p-5">
        <Menu />
      </section>
      <section className="flex-[6] p-5 overflow-y-scroll">
        <Outlet context={{ data, isLoading, refetch }} />
      </section>
    </div>
  );
};

export default DashboardLayout;
