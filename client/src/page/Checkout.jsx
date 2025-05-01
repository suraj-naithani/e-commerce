import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useNewOrderMutation } from "../redux/api/orderAPI";
import { clearCart } from "../redux/reducer/cartReducer";
import { useRemoveFromCartMutation } from "../redux/api/cartApi";

const responseToast = (res, navigate, url) => {
  if ("data" in res) {
    toast.success(res.data.message);
    if (navigate) navigate(url);
  } else {
    const error = res.error;
    const messageResponse = error.data;
    toast.error(messageResponse.message);
  }
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CheckOutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.authReducer);

  const {
    shippingInfo,
    cartItems,
    subtotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state) => state.cartReducer);

  const [isProcessing, setIsProcessing] = useState(false);

  const [newOrder] = useNewOrderMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    setIsProcessing(true);

    const orderData = {
      shippingInfo,
      orderItems: {
        name: cartItems[0].productId.name,
        photo: cartItems[0].productId.image.url,
        price: cartItems[0].productId.price,
        quantity: cartItems[0].quantity,
      },
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      user: user?._id,
      productId: cartItems[0].productId._id,
      sellerId: cartItems[0].productId.seller,
    };

    const { paymentIntent, error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: "if_required",
    });

    if (error) {
      setIsProcessing(false);
      return toast.error(error.message || "Something went wrong");
    }
    if (paymentIntent?.status === "succeeded") {
      const res = await newOrder(orderData);
      await removeFromCart(cartItems[0].productId._id);
      dispatch(clearCart());
      responseToast(res, navigate, "/orders");
    }
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <form onSubmit={submitHandler} className="space-y-4 w-full">
        <PaymentElement className="border p-4 rounded-md" />
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-2 bg-black text-white font-semibold rounded-md shadow-md disabled:bg-gray-400"
        >
          {isProcessing ? "Processing..." : "Pay"}
        </button>
      </form>
    </div>
  );
};

const Checkout = () => {
  const location = useLocation();
  const clientSecret = location.state;

  if (!clientSecret) return <Navigate to="/shipping" />;

  return (
    <Elements
      options={{
        clientSecret: clientSecret,
      }}
      stripe={stripePromise}
    >
      <CheckOutForm />
    </Elements>
  );
};

export default Checkout;
