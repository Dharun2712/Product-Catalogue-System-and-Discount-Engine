const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
