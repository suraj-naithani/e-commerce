import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectRoute from "./auth/ProtectRoute";
import DashboardLayout from "./layout/DashboardLayout";
import MainLayout from "./layout/MainLayout";
import ProtectedLayout from "./layout/ProtectedLayout";
import SingleProduct from "./page/SingleProduct";
import { useGetCartQuery } from "./redux/api/cartApi";
import { useFetchUserProfileQuery } from "./redux/api/profileApi";
import { userExists, userNotExist } from "./redux/reducer/authReducer";
import { setCart } from "./redux/reducer/cartReducer";

const Home = lazy(() => import("./page/Home"));
const Product = lazy(() => import("./page/Product"));
const Cart = lazy(() => import("./page/Cart"));
const Wishlist = lazy(() => import("./page/Wishlist"));
const Profile = lazy(() => import("./page/Profile"));
const Setting = lazy(() => import("./page/Setting"));
const Signup = lazy(() => import("./page/Signup"));
const Signin = lazy(() => import("./page/Signin"));
const DashboardHome = lazy(() => import("./page/dashboard/DashboardHome"));
const DashboardProducts = lazy(() =>
  import("./page/dashboard/DashboardProducts")
);
const DashboardOrders = lazy(() => import("./page/dashboard/DashboardOrders"));
const DashboardSetting = lazy(() =>
  import("./page/dashboard/DashboardSetting")
);
const DashboardProfile = lazy(() =>
  import("./page/dashboard/DashboardProfile")
);

const DashboardReview = lazy(() => import("./page/dashboard/DashboardReview"));

const Shipping = lazy(() => import("./page/Shipping"));
const Checkout = lazy(() => import("./page/Checkout"));
const Orders = lazy(() => import("./page/Orders"));

const App = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.authReducer);
  const { data, error } = useFetchUserProfileQuery(undefined, {
    skip: !!user,
  });

  const { data: cartData } = useGetCartQuery();

  useEffect(() => {
    if (data) {
      dispatch(userExists(data.user));
    } else if (error) {
      dispatch(userNotExist());
    }
  }, [user, data, error, dispatch]);

  useEffect(() => {
    if (cartData) {
      dispatch(setCart(cartData));
    }
  }, [user, cartData, dispatch]);

  return (
    <BrowserRouter>
      <Suspense fallback={"Loading..."}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/product"
            element={
              <MainLayout>
                <Product />
              </MainLayout>
            }
          />

          <Route path="/product">
            <Route
              path=":id"
              element={
                <MainLayout>
                  <SingleProduct />
                </MainLayout>
              }
            />
          </Route>

          {/* Protected Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedLayout user={user}>
                <Cart />
              </ProtectedLayout>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedLayout user={user}>
                <Wishlist />
              </ProtectedLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedLayout user={user}>
                <Profile />
              </ProtectedLayout>
            }
          />

          <Route
            path="/setting"
            element={
              <ProtectedLayout user={user}>
                <Setting />
              </ProtectedLayout>
            }
          />

          {/* Auth Routes */}
          <Route
            path="/signup"
            element={
              <ProtectRoute user={!user} redirect="/">
                <Signup />
              </ProtectRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <ProtectRoute user={!user} redirect="/">
                <Signin />
              </ProtectRoute>
            }
          />

          <Route>
            <Route
              path="/shipping"
              element={
                <ProtectedLayout user={user}>
                  <Shipping />
                </ProtectedLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedLayout user={user}>
                  <Orders />
                </ProtectedLayout> 
              }
            />
            <Route
              path="/pay"
              element={
                <ProtectedLayout user={user}>
                  <Checkout />
                </ProtectedLayout>
              }
            />
          </Route>

          <Route
            element={
              <ProtectRoute user={user}>
                <DashboardLayout />
              </ProtectRoute>
            }
          >
            <Route path="/dashboard/home" element={<DashboardHome />} />
            <Route path="/dashboard/products" element={<DashboardProducts />} />
            <Route path="/dashboard/allOrder" element={<DashboardOrders />} />
            <Route path="/dashboard/stats" element={<DashboardHome />} />
            <Route path="/dashboard/profile" element={<DashboardProfile />} />
            <Route path="/dashboard/setting" element={<DashboardSetting />} />
            <Route path="/dashboard/reviews" element={<DashboardReview />} />
          </Route>
        </Routes>
      </Suspense>

      <Toaster
        position="top-center"
        toastOptions={{
          className: "custom-toast",
        }}
      />
    </BrowserRouter>
  );
};

export default App;
