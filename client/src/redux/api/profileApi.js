import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${server}/api/v1/profile/`,
    credentials: "include",
  }),
  tagTypes: ["users"],

  endpoints: (builder) => ({
    fetchUserProfile: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
      }),
      providesTags: ["users"],
    }),

    updateUserProfile: builder.mutation({
      query: (updateUser) => ({
        url: "updateProfile",
        method: "PUT",
        body: updateUser,
      }),
      invalidatesTags: ["users"],
    }),

    deleteUser: builder.mutation({
      query: () => ({
        url: `deleteProfile`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useFetchUserProfileQuery,
  useUpdateUserProfileMutation,
  useDeleteUserMutation,
} = profileApi;
