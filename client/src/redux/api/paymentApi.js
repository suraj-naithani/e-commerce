import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/order/`,
    credentials: "include",
  }),
  tagTypes: ["payment"],

  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: (paymentData) => ({
        url: "create",
        method: "POST",
        body: paymentData,
      }),
    }),
  }),
});

export const { useCreatePaymentIntentMutation } = paymentApi;
