import { AiOutlineProduct } from "react-icons/ai";
import { FaRupeeSign, FaUserCog } from "react-icons/fa";
import { IoCartOutline, IoPeople } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import {
  BarChart,
  DoughnutChart,
  LineChart,
} from "../../components/dashboard/Charts";

const DashboardHome = () => {
  const userRole = useSelector((state) => state.authReducer?.user?.role);

  const { data, isLoading, refetch } = useOutletContext();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Stats Section */}
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
        {(userRole === "Admin"
          ? [
              {
                icon: <AiOutlineProduct className="text-2xl" />,
                bgColor: "bg-red-500",
                label: "Total product",
                value: data?.stats?.totalProduct,
              },
              {
                icon: <IoPeople className="text-2xl" />,
                bgColor: "bg-orange-500",
                label: "Total users",
                value: data?.stats?.totalUser,
              },
              {
                icon: <FaUserCog className="text-2xl" />,
                bgColor: "bg-yellow-400",
                label: "Total seller",
                value: data?.stats?.totalSeller,
              },
              {
                icon: <FaRupeeSign className="text-2xl" />,
                bgColor: "bg-green-500",
                label: "Total earning",
                value: data?.stats?.totalEarning,
              },
            ]
          : [
              {
                icon: <AiOutlineProduct className="text-2xl" />,
                bgColor: "bg-red-500",
                label: "Total Orders",
                value: data?.stats?.totalOrder,
              },
              {
                icon: <IoCartOutline className="text-2xl" />,
                bgColor: "bg-green-500",
                label: "Today's Orders",
                value: data?.stats?.todayOrder,
              },
              {
                icon: <FaRupeeSign className="text-2xl" />,
                bgColor: "bg-blue-500",
                label: "Today's Earnings",
                value: data?.stats?.todayEarning,
              },
              {
                icon: <FaRupeeSign className="text-2xl" />,
                bgColor: "bg-orange-500",
                label: "Total Earnings",
                value: data?.stats?.totalEarning,
              },
            ]
        ).map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-5 p-4 bg-white rounded shadow-sm"
          >
            <div className={`p-4 text-white rounded-full ${item.bgColor}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="flex flex-wrap gap-6 justify-center w-full">
        <div className="flex-[5] h-[400px] p-5 bg-white rounded shadow-sm w-full lg:w-auto">
          <LineChart
            dataList={data.stats.monthlyEarnings}
            title="Monthly Earnings"
          />
        </div>
        <div className="flex-[3] h-[400px] p-5 bg-white rounded shadow-sm w-full lg:w-auto">
          <BarChart dataList={data.stats.weeklyDayEarnings} />
        </div>
      </div>

      {userRole == "Admin" && (
        <div className="flex flex-wrap gap-6 justify-center w-full">
          <div className="flex-[5] h-[400px] p-5 bg-white rounded shadow-sm w-full lg:w-auto">
            <h4 className="font-semibold text-gray-600 py-1">Most View Product</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">
                      Product
                    </th>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">
                      Price
                    </th>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">
                      Seller
                    </th>
                    <th className="p-2 text-left text-sm font-semibold text-gray-600">
                      Views
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.stats?.products?.slice(0, 5).map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-2">
                        <h2 className="text-sm text-gray-800">
                          {product.name}
                        </h2>
                      </td>
                      <td className="p-2">
                        <p className="text-sm text-green-600">
                          ${product.price}
                        </p>
                      </td>
                      <td className="p-2">
                        <p className="text-sm text-gray-500">
                          {product.seller.name}
                        </p>
                      </td>
                      <td className="p-2">
                        <p className="text-sm text-gray-500">
                          {product.hitCount}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex-[3] h-[400px] p-5 bg-white rounded shadow-sm w-full lg:w-auto">
            <DoughnutChart
              categories={[
                { label: "User", value: data?.stats?.totalUser || 0 },
                { label: "Seller", value: data?.stats?.totalSeller || 0 },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
