import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useUserLogoutMutation } from "../redux/api/authApi";
import { userNotExist } from "../redux/reducer/authReducer";
import toast from "react-hot-toast";
import { IoCartOutline, IoSearchOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { useSearchProductQuery } from "../redux/api/productApi";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchProductQuery(debouncedSearchTerm, {
    skip: !debouncedSearchTerm,
  });

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const dropdownRef = useRef(null);
  const wishlistCount = 2;

  const { user } = useSelector((state) => state.authReducer);
  const { cartItems } = useSelector((state) => state.cartReducer);
  
  const login = user;
  const role = user?.role;

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-white shadow-sm w-full top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-semibold">E-cart</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search here"
                className="w-full px-4 py-2.5 rounded-md bg-gray-100 focus:outline-none focus:ring-2"
                value={search}
                onChange={handleSearchChange}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <IoSearchOutline className="w-5 h-5 text-gray-400" />
              </button>
              {/* Display search results */}
              {debouncedSearchTerm && (
                <div className="absolute bg-white w-full mt-1 rounded-lg shadow-lg z-10">
                  {isLoading ? (
                    <div className="p-4 text-gray-500">Loading...</div>
                  ) : searchResults?.products.length > 0 && !isError ? (
                    searchResults?.products?.slice(0, 6).map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition duration-200 ease-in-out rounded-md"
                        onClick={() => handleProductClick(product._id)}
                      >
                        <div className="flex-1">
                          <p className="text-gray-800 truncate">
                            {product.name.substr(0, 45)}
                          </p>
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          <p>{product.category}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link to="/product" className="text-gray-700 hover:text-gray-900">
              Product
            </Link>
            <div className="relative">
              <Link to="/cart" className="text-gray-700 hover:text-gray-900">
                <IoCartOutline className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#ef4444] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
            {/* <div className="relative">
              <Link
                to="/wishlist"
                className="text-gray-700 hover:text-gray-900"
              >
                <IoMdHeartEmpty className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div> */}
            {login ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={user ? `https://ui-avatars.com/api/?name=${user.name}&background=random` : "./avatar.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {role == "Buyer" && (
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    )}
                    {(role == "Admin" || role == "Seller") && (
                      <Link
                        to="/dashboard/home"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Order
                    </Link>
                    <Link
                      to="/setting"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <Link
                      to="/signin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signin"
                className="bg-white text-gray-800 border border-transparent outline outline-gray-800 outline-1 px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white hover:outline-white hover:border-gray-800 transition duration-300"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/product"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Product
            </Link>
            <Link
              to="/cart"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Cart
            </Link>
            {/* <Link
              to="wishlist"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Wishlist
            </Link> */}
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
