import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/cart/`,
    credentials: "include",
  }),
  tagTypes: ["cart"],

  endpoints: (builder) => ({
    newCart: builder.mutation({
      query: (product) => ({
        url: "addToCart",
        method: "POST",
        body: product,
      }),
      invalidatesTags: ["cart"],
    }),

    getCart: builder.query({
      query: () => ({
        url: "cartProduct",
        method: "GET",
      }),
      providesTags: ["cart"],
    }),

    decreaseQuantity: builder.mutation({
      query: (productId) => ({
        url: "decreaseQuantity",
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: ["cart"],
    }),

    increaseQuantity: builder.mutation({
      query: (productId) => ({
        url: "increaseQuantity",
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: ["cart"],
    }),

    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: "removeFromCart",
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: ["cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useNewCartMutation,
  useRemoveFromCartMutation,
  useDecreaseQuantityMutation,
  useIncreaseQuantityMutation,
} = cartApi;
