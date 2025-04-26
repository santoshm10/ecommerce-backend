
const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products"
    }
})

const Cart = mongoose.model("Cart", cartSchema)

module.exports = Cart