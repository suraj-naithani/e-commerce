import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  order: null,
  isLoading: true,
};

export const orderReducer = createSlice({
  name: "orderReducer",
  initialState,
  reducers: {
    addOrder: (state, action) => {
      state.order = action.payload;
      state.isLoading = false;
    },
    updateOrders: (state, action) => {
      state.isLoading = true;
      state.order = state.order.map((item) =>
        item._id === action.payload._id ? { ...item, ...action.payload } : item
      );
      state.isLoading = false;
    },
  },
});

export const { addOrder, updateOrders } = orderReducer.actions;
