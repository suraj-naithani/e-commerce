import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const sellerApi = createApi({
  reducerPath: "sellerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/seller/`,
    credentials: "include",
  }),
  tagTypes: ["seller"],

  endpoints: (builder) => ({
    newProduct: builder.mutation({
      query: (user) => ({
        url: "createProduct",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["seller"],
    }),

    getProducts: builder.query({
      query: () => ({
        url: "products",
        method: "GET",
      }),
      providesTags: ["seller"],
    }),

    updateProduct: builder.mutation({
      query: (updatedProductData) => ({
        url: `updateProduct/${updatedProductData.get("id")}`,
        method: "PUT",
        body: updatedProductData,
      }),
      invalidatesTags: ["seller"],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `deleteProduct/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["seller"],
    }),
  }),
});

export const {
  useNewProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = sellerApi;
