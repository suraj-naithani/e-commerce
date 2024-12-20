import { Product } from "../model/product.js";

const products = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error in fetching products" });
  }
};

const product = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.hitCount += 1;
    await product.save();

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error in fetching products" });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { product } = req.query;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "product name is required for search",
      });
    }

    const products = await Product.find({
      name: { $regex: new RegExp(product, "i") },
    });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in search API" });
  }
};

export { searchProduct, products, product };
