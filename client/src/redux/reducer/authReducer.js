import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoading: true,
  role: "",
};

export const authReducer = createSlice({
  name: "authReducer",
  initialState,
  reducers: {
    userExists: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      state.role = action.payload.role;
    },
    userNotExist: (state) => {
      state.user = null;
      state.isLoading = false;
      state.role = "";
    },
  },
});

export const { userExists, userNotExist } = authReducer.actions;
