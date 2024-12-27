/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../redux/api/orderAPI";

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data, isLoading, isError, error } = useGetMyOrdersQuery();
  console.log(data)

  const currentOrders =
    data?.orders?.filter(
      (order) => order.status === "Processing" || order.status === "Shipped"
    ) || [];
  const previousOrders =
    data?.orders?.filter((order) => order.status === "Delivered") || [];

  const Timeline = ({ status }) => {
    const steps = ["processing", "shipped", "delivered"];
    const currentStep = steps.indexOf(status.toLowerCase());

    return (
      <div className="flex items-center justify-between w-full max-w-md mx-auto mt-8">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center z-10
                ${
                  index <= currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-sm capitalize">{step}</div>
            {index < steps.length - 1 && (
              <div
                className={`absolute h-[2px] w-[166px] top-4 left-[2.6rem]
                  ${index < currentStep ? "bg-green-500" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const StatusPopup = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Order Status</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <Timeline status={order.status} />
          <div className="mt-8 text-center">
            <div className="text-lg font-medium mb-2">
              Estimated Delivery: 3-5 Business Days
            </div>
            <div className="text-sm text-gray-600">
              Your order is currently {order.status.toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderItem = ({ item, status }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 relative">
      <div className="w-[100px] h-[130px] flex-shrink-0">
        <img
          src={item.photo}
          alt={item.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      <div className="flex-grow">
        <div className="text-sm text-gray-500">
          {item.category || "Category"}
        </div>
        <h4 className="font-medium mt-2">{item.name}</h4>
        <p className="text-gray-600 text-sm mt-2">{item.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold">₹{item.price}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <span className="text-sm text-green-600 capitalize">{status}</span>
        </div>
      </div>

      <div className="text-sm text-gray-600">Qty {item.quantity}</div>
    </div>
  );

  const OrderSection = ({ title, orders }) => (
    <div className="mb-8 flex flex-col gap-2">
      <h4 className=" font-normal mb-4">{title}</h4>
      {orders.map((order) => (
        <div
          key={order._id}
          className={`space-y-4 ${
            title === "Current Orders" ? "cursor-pointer" : ""
          }`}
          onClick={() => title === "Current Orders" && setSelectedOrder(order)}
        >
          {order.orderItems && (
            <OrderItem item={order.orderItems} status={order.status} />
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto p-6 w-full">
      <div className="mb-8 text-center flex justify-between">
        <h3 className="text-2xl font-semibold text-gray-800">Orders</h3>
        <p className="text-gray-600">
          <Link to="/" className="hover:underline">
            home
          </Link>{" "}
          /{" "}
          <Link to="/orders" className="hover:underline">
            orders
          </Link>
        </p>
      </div>
      {currentOrders && (
        <OrderSection title="Current Orders" orders={currentOrders} />
      )}
      {previousOrders && (
        <OrderSection title="Previous Orders" orders={previousOrders} />
      )}

      <StatusPopup
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default Orders;
