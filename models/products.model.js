
const mongoose = require("mongoose")

const productsSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    imageUrls: [
      {
        type: String,
        required: true,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
    },
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    returnPolicy: {
      type: String,
      enum: ["10 days Returnable", "Exchange Only", "No"],
      required: true,
    },
    isPayOnDelivery: {
      type: Boolean,
      required: true,
    },
    isFreeDelivery: {
      type: Boolean,
      required: true,
    },
    isSecurePayment: {
      type: Boolean,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
    },
    // Optional:
    // stock: {
    //   type: Number,
    //   default: 0
    // }
  },
  { timestamps: true })

const Products = mongoose.model("Products", productsSchema)

module.exports = Products