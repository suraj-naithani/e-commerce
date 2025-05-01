import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/order/`,
    credentials: "include",
  }),
  tagTypes: ["users"],

  endpoints: (builder) => ({
    newOrder: builder.mutation({
      query: (user) => ({
        url: "new",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["order"],
    }),

    getOrders: builder.query({
      query: () => ({
        url: "allOrdered",
        method: "GET",
      }),
      providesTags: ["order"],
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: "myOrders",
        method: "GET",
      }),
      providesTags: ["order"],
    }),

    updateOrder: builder.mutation({
      query: (id) => ({
        url: `${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["order"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useNewOrderMutation,
  useUpdateOrderMutation,
  useGetMyOrdersQuery
} = orderApi;
