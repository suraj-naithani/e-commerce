import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./reducer/authReducer";
import { authApi } from "./api/authApi";
import { profileApi } from "./api/profileApi";

const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [authReducer.name]: authReducer.reducer,
  },
  middleware: (mid) => [...mid(), authApi.middleware, profileApi.middleware],
});

export default store;
