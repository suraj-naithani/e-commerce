import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/dashboard`,
    credentials: "include",
  }),
  tagTypes: ["dashboard"],
  endpoints: (builder) => ({
    getAdminDashboardData: builder.query({
      query: () => ({
        url: "/adminDashboard",
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),
    getSellerDashboardData: builder.query({
      query: () => ({
        url: "/sellerDashboard",
        method: "GET",
      }),
      providesTags: ["dashboard"],
    }),
  }),
});

export const { useGetAdminDashboardDataQuery, useGetSellerDashboardDataQuery } =
  dashboardApi;
