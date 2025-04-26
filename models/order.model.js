const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products"
    },
    quantity: {
        type: Number,
        required: true,
    }
})

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderItem: {
        type: [orderItemSchema]
    },
    orderPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CANCELLED', 'DELIVERED'],
        default: 'PENDING',
    }
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order