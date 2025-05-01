import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  shippingInfo: {
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: 0,
  },
  shippingCharges: 0,
  discount: 0,
  total: 0,
  isLoading: false,
};

export const cartReducer = createSlice({
  name: "cartReducer",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, quantity } = action.payload;

      const existingProductIndex = state.cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (existingProductIndex >= 0) {
        state.cartItems[existingProductIndex].quantity += quantity;
      } else {
        state.cartItems.push({ productId, quantity });
      }
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;

      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== productId
      );
    },

    updateCartItem: (state, action) => {
      const { productId, quantity } = action.payload;

      state.cartItems = state.cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    },

    setCart: (state, action) => {
      const cartData = action.payload;

      state.cartItems = cartData.cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.shippingInfo = {
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: 0,
      };
      state.shippingCharges = 0;
      state.discount = 0;
      state.total = 0;
    },

    saveShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
    },

    setTotal: (state) => {
      state.total = state.cartItems.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
      );
    },

    updateShippingCharges: (state, action) => {
      state.shippingCharges = action.payload;
    },

    updateDiscount: (state, action) => {
      state.discount = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  setCart,
  clearCart,
  setTotal,
  saveShippingInfo,
  updateShippingCharges,
  updateDiscount,
} = cartReducer.actions;
