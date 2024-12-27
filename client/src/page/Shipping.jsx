/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCreatePaymentIntentMutation } from "../redux/api/paymentApi";
import toast from "react-hot-toast";
import { saveShippingInfo } from "../redux/reducer/cartReducer";

const Shipping = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, total } = useSelector((state) => state.cartReducer);

  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  const changeHandler = (e) => {
    setShippingInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const data = await createPaymentIntent({ amount: total }).unwrap();
      dispatch(saveShippingInfo(shippingInfo));
      navigate("/pay", {
        state: data.clientSecret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (cartItems.length <= 0) navigate("/cart");
  }, [cartItems, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      <div className="mb-8 text-center flex justify-between w-full">
        <h3 className="text-2xl font-semibold text-gray-800">Shipping</h3>
        <p className="text-gray-600">
          <button
            onClick={() => navigate("/cart")}
            className="hover:underline flex flex-row gap-2 items-center"
          >
            <BiArrowBack size={20} />
            Back to Cart
          </button>
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg mt-6 w-full max-w-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Shipping Address
        </h2>
        <form onSubmit={submitHandler} className="space-y-4">
          <InputField
            label="Address"
            name="address"
            value={shippingInfo.address}
            onChange={changeHandler}
          />
          <InputField
            label="City"
            name="city"
            value={shippingInfo.city}
            onChange={changeHandler}
          />
          <InputField
            label="State"
            name="state"
            value={shippingInfo.state}
            onChange={changeHandler}
          />
          <SelectField
            label="Country"
            name="country"
            value={shippingInfo.country}
            onChange={changeHandler}
            options={["Choose Country", "India"]}
          />
          <InputField
            label="PinCode"
            name="pinCode"
            type="number"
            value={shippingInfo.pinCode}
            onChange={changeHandler}
          />

          <button
            type="submit"
            className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type = "text", value, onChange }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option} value={option === "Choose Country" ? "" : option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default Shipping;
