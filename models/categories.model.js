const mongoose = require("mongoose")

const categoriesSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    }
})


const Categories = mongoose.model("Categories", categoriesSchema)

module.exports = Categories