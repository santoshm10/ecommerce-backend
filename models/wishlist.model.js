
const mongoose = require("mongoose")

const wishlistSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products"
    }
})

const Wishlist = mongoose.model("Wishlist", wishlistSchema)

module.exports = Wishlist