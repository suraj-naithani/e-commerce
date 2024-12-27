import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/products/`,
    credentials: "include",
  }),
  tagTypes: ["product"],

  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: "product",
        method: "GET",
      }),
      providesTags: ["product"],
    }),

    getSingleProduct: builder.query({
      query: (id) => ({
        url: `${id}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),

    searchProduct: builder.query({
      query: (search) => ({
        url: `searchProduct?product=${search}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetSingleProductQuery,
  useSearchProductQuery,
} = productApi;
