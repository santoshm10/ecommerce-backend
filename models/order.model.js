const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
    product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
})

const orderSchema = new mongoose.Schema(
    {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItem: {
      type: [orderItemSchema],
      required: true,
    },
    orderPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "DELIVERED"],
      default: "PENDING",
    },
    // Optional fields
    // paymentStatus: {
    //   type: String,
    //   enum: ["PAID", "UNPAID", "REFUNDED"],
    //   default: "UNPAID"
    // },
    // deliveredAt: Date
  },
  { timestamps: true }
)

const Order = mongoose.model("Order", orderSchema)

module.exports = Order