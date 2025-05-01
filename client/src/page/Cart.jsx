import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useRemoveFromCartMutation } from "../redux/api/cartApi";
import toast from "react-hot-toast";
import {
  removeFromCart,
  setTotal,
  updateDiscount,
  updateShippingCharges,
} from "../redux/reducer/cartReducer";
import { IoCartOutline } from "react-icons/io5";
import { useEffect } from "react";

const Cart = () => {
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cartReducer);
  const [removeItemFromCart] = useRemoveFromCartMutation();

  const totalPrice =
    cartItems && cartItems.length
      ? cartItems.reduce((total, product) => {
          const price = Number(product.productId.originalPrice) || 0;
          const quantity = product.quantity || 0;
          return total + price * quantity;
        }, 0)
      : 0;

  const totalDiscountPrice =
    cartItems && cartItems.length
      ? cartItems.reduce((total, product) => {
          const price = Number(product.productId.price) || 0;
          const quantity = product.quantity || 0;
          return total + price * quantity;
        }, 0)
      : 0;

  const shippingFee =
    cartItems && cartItems.length
      ? cartItems.reduce((total, product) => {
          const fee = Number(product.productId.shippingFee) || 0;
          const quantity = product.quantity || 0;
          if (quantity === 1 && product.price < 300) {
            return total + fee;
          } else {
            return total;
          }
        }, 0)
      : 0;

  const handleRemoveFromCart = async (productId) => {
    const toastId = toast.loading("Adding to cart...");
    console.log(productId);
    try {
      const response = await removeItemFromCart(productId);
      if (response.data.success) {
        removeFromCart(productId);
        toast.success("Product added successfully!", { id: toastId });
      }
    } catch (error) {
      toast.error("An error occurred during adding.", { id: toastId });
    }
  };

  useEffect(() => {
    dispatch(setTotal());
    dispatch(updateShippingCharges(shippingFee));
    dispatch(updateDiscount(totalDiscountPrice));
  }, [dispatch, cartItems, shippingFee, totalPrice, totalDiscountPrice]);

  return cartItems && cartItems.length ? (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-8 text-center flex justify-between">
        <h3 className="text-2xl font-semibold text-gray-800">Products</h3>
        <p className="text-gray-600">
          <Link to="/" className="hover:underline">
            home
          </Link>{" "}
          /{" "}
          <Link to="/cart" className="hover:underline">
            cart
          </Link>
        </p>
      </div>

      <div className="flex gap-8 flex-wrap">
        <div className="flex-2 space-y-6">
          {cartItems.map((product) => (
            <div
              key={product.productId._id}
              className="flex gap-6 border border-gray-300 p-5 rounded-lg"
            >
              <img
                src={product.productId.image.url}
                alt={product.productId.name}
                className="object-cover w-24 h-26"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {product.productId.category}
                  </span>
                  <span
                    className="cursor-pointer"
                    onClick={() => handleRemoveFromCart(product.productId._id)}
                  >
                    <IoClose size={20} />
                  </span>
                </div>
                <Link to={`/product/${product.productId._id}`}>
                  <h4 className="font-medium mt-2">{product.productId.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.productId.description.slice(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-gray-800 flex gap-2">
                      <p className="line-through text-sm text-gray-500">
                        ₹{product.productId.originalPrice}
                      </p>
                      <p className="font-semibold">
                        ₹{product.productId.price}
                      </p>
                    </div>
                    <p className="text-gray-600">Qty {product.quantity}</p>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-6">
          <h4 className="font-semibold">
            Price Details ({cartItems.length} items)
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <p>Total MRP</p>
              <p>₹{totalPrice}</p>
            </div>
            <div className="flex justify-between">
              <p>Discount on MRP</p>
              <p>-₹{totalPrice - totalDiscountPrice}</p>
            </div>
            <div className="flex justify-between">
              <p>Shipping Fee</p>
              <p>₹{shippingFee}</p>
            </div>
            <hr className="border-gray-300" />
            <div className="flex justify-between">
              <h4 className="font-semibold">Total Amount</h4>
              <h4>{totalDiscountPrice + shippingFee}</h4>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center mt-6 w-full justify-end">
        <Link
          to="/shipping"
          className="flex flex-row gap-2 items-center px-4 py-2 outline-none bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
        >
          <IoCartOutline size={20} />
          Checkout
        </Link>
      </div>
    </div>
  ) : (
    <h1 className="text-center text-gray-500 text-xl font-medium mt-8">
      No product
    </h1>
  );
};

export default Cart;
