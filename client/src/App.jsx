import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectRoute from "./auth/ProtectRoute";
import MainLayout from "./layout/MainLayout";
import ProtectedLayout from "./layout/ProtectedLayout";
import { useFetchUserProfileQuery } from "./redux/api/profileApi";
import { userExists, userNotExist } from "./redux/reducer/authReducer";

// Lazy loaded pages
const Home = lazy(() => import("./page/Home"));
const Product = lazy(() => import("./page/Product"));
const Cart = lazy(() => import("./page/Cart"));
const Wishlist = lazy(() => import("./page/Wishlist"));
const Profile = lazy(() => import("./page/Profile"));
const Setting = lazy(() => import("./page/Setting"));
const Signup = lazy(() => import("./page/Signup"));
const Signin = lazy(() => import("./page/Signin"));

const App = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.authReducer);
  const { data, error } = useFetchUserProfileQuery(undefined, {
    skip: !!user,
  });

  useEffect(() => {
    if (data) {
      dispatch(userExists(data.user));
    } else if (error) {
      dispatch(userNotExist());
    }
  }, [data, error, dispatch]);

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
            path="/dashboard"
            element={
              <ProtectedLayout user={user}>
                <Home />
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
