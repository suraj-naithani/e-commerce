import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useOutletContext } from "react-router-dom";
import Table from "../../components/dashboard/Table";
import { useGetOrdersQuery } from "../../redux/api/orderApi";
import { addProduct } from "../../redux/reducer/productReducer";
import UpdateOrderStatus from "../../components/dialog/UpdateOrderStatus";
import { addOrder } from "../../redux/reducer/orderReducer";

const DashboardOrders = () => {
  const userRole = useSelector((state) => state.authReducer?.user?.role);

  const dispatch = useDispatch();

  const { data, isLoading } = useGetOrdersQuery();

  const {
    data: adminData,
    isLoading: adminIsLoading,
    refetch,
  } = useOutletContext();

  useEffect(() => {
    if (data) {
      dispatch(addOrder(data.orders));
    }
  }, [data, dispatch]);

  const adminHeadings = [
    "S.No",
    "Image",
    "Product Name",
    "Seller Name",
    "Seller Email",
    "Seller Phone",
    "User Name",
    "User Email",
    "User Phone",
    "Quantity",
    "Price",
    "Status",
  ];

  const sellerHeadings = [
    "S.No",
    "Image",
    "Product Name",
    "User Name",
    "User Email",
    "User Phone",
    "Quantity",
    "Price",
    "Status",
    "Actions",
  ];
console.log(adminData?.stats.allOrder)
  const adminTableData =
    adminData?.stats?.allOrder?.map((order, i) => ({
      "s.no": i + 1,
      image: (
        <img
          src={order.orderItems?.photo}
          alt={order.orderItems?.name}
          className="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-110"
        />
      ),
      "product name": order.orderItems?.name,
      "seller name": order.sellerId?.name,
      "seller email": order.sellerId?.email,
      "seller phone": order.sellerId?.phone,
      "user name": order.user?.name,
      "user email": order.user?.email,
      "user phone": order.user?.phone,
      quantity: order.orderItems?.quantity,
      price: `₹${order.orderItems?.price}`,
      discount: order.discount,
      "shipping charges": `₹${order.shippingCharges}`,
      total: `₹${order.total}`,
      status: (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            order.status === "Delivered"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status}
        </span>
      ),
      "order date": new Date(order.createdAt).toLocaleDateString(),
    })) || [];

  const sellerTableData =
    data?.orders?.map((order, i) => ({
      "s.no": i + 1,
      image: (
        <img
          src={order.orderItems?.photo}
          alt={order.orderItems?.name}
          className="w-16 h-16 object-cover rounded-lg shadow-sm transition-transform duration-300 hover:scale-110"
        />
      ),
      "product name": order.orderItems?.name,
      "user name": order.user?.name,
      "user email": order.user?.email,
      "user phone": order.user?.phone || "N/A",
      quantity: order.orderItems?.quantity,
      price: `₹${order.orderItems?.price}`,
      status: (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            order.status === "Delivered"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status}
        </span>
      ),
      actions: (
        <div className="flex gap-2">
          <UpdateOrderStatus orderData={order} />
        </div>
      ),
    })) || [];

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#ffffff] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-gray-800">Products</h3>
        <p className="text-gray-600">
          <Link to="/" className="hover:underline">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link to="/product" className="hover:underline">
            Products
          </Link>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {userRole === "Admin"
          ? !adminIsLoading && (
              <Table headings={adminHeadings} data={adminTableData} />
            )
          : !isLoading && (
              <Table headings={sellerHeadings} data={sellerTableData} />
            )}
      </div>
    </div>
  );
};

export default DashboardOrders;
