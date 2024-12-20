import mongoose from "mongoose";
import { Product } from "../model/product.js";
import {
  deleteFileToCloudinary,
  uploadFileToCloudinary,
} from "../utils/features.js";

const createProduct = async (req, res) => {
  try {
    const userId = req.user;
    const { name, description, price, category, stock } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload images",
      });
    }

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const result = await uploadFileToCloudinary([file]);
    const image = {
      public_id: result[0].public_id,
      url: result[0].url,
    };

    const newProduct = await Product.create({
      seller: userId,
      name,
      description,
      price,
      category,
      stock: stock || 0,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const products = async (req, res) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user);
    const allProducts = await Product.find({ seller: sellerId });
    return res.status(200).json({
      success: true,
      message: "All products",
      allProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const product = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.id);
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category, stock } = req.body;
    const file = req.file;

    const product = await Product.findById(productId);

    if (req.user != product.seller) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this product",
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updates = {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      stock: stock || product.stock,
    };

    let image = product.image;
    if (file) {
      await deleteFileToCloudinary(product.image.public_id);
      const result = await uploadFileToCloudinary([file]);
      image = {
        public_id: result[0].public_id,
        url: result[0].url,
      };
      updates.image = image;
    }

    const hasChanges = Object.keys(updates).some(
      (key) => updates[key] !== undefined && updates[key] !== product[key]
    );

    Object.assign(product, updates);

    if (hasChanges) {
      await product.save();
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No changes",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (req.user != product.seller) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this product",
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    await deleteFileToCloudinary(product.image.public_id);
    await Product.findByIdAndDelete(productId);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

export { createProduct, deleteProduct, product, products, updateProduct };
