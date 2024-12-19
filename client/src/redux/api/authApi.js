import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/auth/`,
    credentials: "include",
  }),
  tagTypes: ["users"],

  endpoints: (builder) => ({
    userSignup: builder.mutation({
      query: (user) => ({
        url: "signup",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),

    userSignIn: builder.mutation({
      query: (user) => ({
        url: "signin",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["users"],
    }),

    userLogout: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useUserSignupMutation,
  useUserSignInMutation,
  useUserLogoutMutation,
} = authApi;
