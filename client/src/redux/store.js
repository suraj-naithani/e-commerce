import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./reducer/authReducer";
import { authApi } from "./api/authApi";
import { profileApi } from "./api/profileApi";
import { dashboardApi } from "./api/dashboardApi";
import { sellerApi } from "./api/sellerApi";
import { productReducer } from "./reducer/productReducer";
import { orderReducer } from "./reducer/orderReducer";
import { productApi } from "./api/productApi";
import { cartApi } from "./api/cartApi";
import { cartReducer } from "./reducer/cartReducer";
import { paymentApi } from "./api/paymentApi";
import { orderApi } from "./api/orderAPI";
import { reviewApi } from "./api/reviewAPi";

const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [sellerApi.reducerPath]: sellerApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [authReducer.name]: authReducer.reducer,
    [productReducer.name]: productReducer.reducer,
    [orderReducer.name]: orderReducer.reducer,
    [cartReducer.name]: cartReducer.reducer,
  },
  middleware: (mid) => [
    ...mid(),
    authApi.middleware,
    profileApi.middleware,
    dashboardApi.middleware,
    sellerApi.middleware,
    orderApi.middleware,
    productApi.middleware,
    cartApi.middleware,
    paymentApi.middleware,
    reviewApi.middleware,
  ],
});

export default store;
