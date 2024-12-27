import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  product: null,
  isLoading: true,
};

export const productReducer = createSlice({
  name: "productReducer",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      state.product = action.payload;
      state.isLoading = false;
    },
    removeProduct: (state, action) => {
      state.isLoading = true;
      state.product = state.product.filter((i) => i._id !== action.payload);
      state.isLoading = false;
    },
    updateProduct: (state, action) => {
      state.isLoading = true;
      state.product = state.product.map((item) =>
        item._id === action.payload._id ? { ...item, ...action.payload } : item
      );
      state.isLoading = false;
    },
  },
});

export const { addProduct, removeProduct, updateProduct } =
  productReducer.actions;
